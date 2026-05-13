export const CRITERIA_TYPES = ["BENEFIT", "COST"] as const;
export type CriteriaType = (typeof CRITERIA_TYPES)[number];

export interface MooraCriteriaInput {
    id: number;
    code: string;
    name: string;
    type: CriteriaType;
    weight: number;
}

export interface MooraAlternativeInput {
    id: number;
    code: string;
    name: string;
}

export interface MooraEvaluationInput {
    alternativeId: number;
    criteriaId: number;
    value: number;
}

export interface MooraRankingRow {
    rank: number;
    alternativeId: number;
    alternativeCode: string;
    alternativeName: string;
    benefitSum: number;
    costSum: number;
    yi: number;
}

export interface MooraResult {
    criteria: MooraCriteriaInput[];
    alternatives: MooraAlternativeInput[];
    decisionMatrix: number[][];
    normalizedMatrix: number[][];
    weightedMatrix: number[][];
    divisors: number[];
    ranking: MooraRankingRow[];
}

export interface WeightValidationResult {
    valid: boolean;
    total: number;
    message: string;
}

export function isCriteriaType(value: string): value is CriteriaType {
    return value === "BENEFIT" || value === "COST";
}

export function validateWeightVector(weights: number[]): WeightValidationResult {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const tolerance = 0.001;
    const diff = total - 1;
    const valid = (diff < 0 ? -diff : diff) <= tolerance;

    return {
        valid,
        total,
        message: valid
            ? "Total bobot valid (1.0)."
            : `Total bobot saat ini ${total.toFixed(4)} (disarankan 1.0).`,
    };
}

export function calculateMooraMatrix(
    alternatives: MooraAlternativeInput[],
    criteria: MooraCriteriaInput[],
    evaluations: MooraEvaluationInput[]
): MooraResult {
    if (alternatives.length < 2) {
        throw new Error("Minimal dua alternatif harus dipilih untuk perhitungan MOORA.");
    }

    if (criteria.length === 0) {
        throw new Error("Data kriteria belum tersedia.");
    }

    const evaluationMap = new Map<string, number>();
    for (const evaluation of evaluations) {
        evaluationMap.set(
            `${evaluation.alternativeId}:${evaluation.criteriaId}`,
            Number(evaluation.value)
        );
    }

    // Step 1: Build decision matrix from selected alternatives only.
    const decisionMatrix = alternatives.map((alternative) =>
        criteria.map((criterion) => {
            const key = `${alternative.id}:${criterion.id}`;
            return evaluationMap.get(key) ?? 0;
        })
    );

    // Step 2: Dynamic normalization divisor per criterion.
    const divisors = criteria.map((_, columnIndex) => {
        const squaredSum = decisionMatrix.reduce(
            (sum, row) => sum + row[columnIndex] * row[columnIndex],
            0
        );
        return squaredSum ** 0.5;
    });

    const normalizedMatrix = decisionMatrix.map((row) =>
        row.map((value, columnIndex) => {
            const divisor = divisors[columnIndex];
            if (divisor === 0) {
                return 0;
            }
            return value / divisor;
        })
    );

    // Step 3: Weighted normalization.
    const weightedMatrix = normalizedMatrix.map((row) =>
        row.map((value, columnIndex) => value * criteria[columnIndex].weight)
    );

    // Step 4 and 5: Yi optimization and descending rank.
    const rankedRows = alternatives.map((alternative, rowIndex) => {
        let benefitSum = 0;
        let costSum = 0;

        for (let columnIndex = 0; columnIndex < criteria.length; columnIndex++) {
            if (criteria[columnIndex].type === "BENEFIT") {
                benefitSum += weightedMatrix[rowIndex][columnIndex];
            } else {
                costSum += weightedMatrix[rowIndex][columnIndex];
            }
        }

        return {
            rank: 0,
            alternativeId: alternative.id,
            alternativeCode: alternative.code,
            alternativeName: alternative.name,
            benefitSum,
            costSum,
            yi: benefitSum - costSum,
        } satisfies MooraRankingRow;
    });

    rankedRows.sort((left, right) => right.yi - left.yi);
    rankedRows.forEach((row, index) => {
        row.rank = index + 1;
    });

    return {
        criteria,
        alternatives,
        decisionMatrix,
        normalizedMatrix,
        weightedMatrix,
        divisors,
        ranking: rankedRows,
    };
}