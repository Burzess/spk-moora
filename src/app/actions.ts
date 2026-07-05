"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
    ensureDefaultAdmin,
    getAdminSession,
    requireAdmin,
    verifyAdminCredentials,
} from "@/lib/auth";
import {
    calculateMooraMatrix,
    isCriteriaType,
    validateWeightVector,
    type MooraResult,
} from "@/lib/moora";
import { prisma } from "@/lib/prisma";

const DEFAULT_AUDIT_WEIGHTS = [0.25, 0.15, 0.25, 0.1, 0.25] as const;

export interface PublicCalculationState {
    error?: string;
    weightInfo?: string;
    selectedAlternativeIds?: number[];
    weights?: number[];
    result?: MooraResult;
}

export interface AuthActionState {
    error?: string;
}

function parseInteger(value: FormDataEntryValue | null): number | null {
    if (typeof value !== "string") {
        return null;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
}

function parseFloatValue(value: FormDataEntryValue | null): number | null {
    if (typeof value !== "string") {
        return null;
    }

    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
}

function parseCriteriaType(rawType: FormDataEntryValue | null) {
    if (typeof rawType !== "string") {
        throw new Error("Tipe kriteria wajib diisi.");
    }

    const normalizedType = rawType.toUpperCase();
    if (!isCriteriaType(normalizedType)) {
        throw new Error("Tipe kriteria harus BENEFIT atau COST.");
    }

    return normalizedType;
}

function parseRequiredText(value: FormDataEntryValue | null, label: string) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} wajib diisi.`);
    }

    return value.trim();
}

function getAuditWeights(criteriaCount: number) {
    if (criteriaCount === DEFAULT_AUDIT_WEIGHTS.length) {
        return [...DEFAULT_AUDIT_WEIGHTS];
    }

    if (criteriaCount <= 0) {
        return [];
    }

    return Array.from({ length: criteriaCount }, () => 1 / criteriaCount);
}

/**
 * CRITICAL: Dynamic MOORA backend logic.
 */
export async function calculateMoora(
    selectedAlternativeIds: number[],
    userWeights: number[]
) {
    const uniqueAlternativeIds = Array.from(
        new Set(selectedAlternativeIds.filter((id) => Number.isInteger(id) && id > 0))
    );

    if (uniqueAlternativeIds.length < 2) {
        throw new Error("Pilih minimal 2 alternatif untuk dihitung.");
    }

    const criteriaFromDb = await prisma.criteria.findMany({
        orderBy: { code: "asc" },
    });

    if (criteriaFromDb.length === 0) {
        throw new Error("Data kriteria belum tersedia.");
    }

    if (userWeights.length !== criteriaFromDb.length) {
        throw new Error("Jumlah bobot harus sesuai jumlah kriteria.");
    }

    const parsedWeights = userWeights.map((weight) => Number(weight));
    if (parsedWeights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
        throw new Error("Bobot harus berupa angka valid dan tidak negatif.");
    }

    const alternativesFromDb = await prisma.alternative.findMany({
        where: { id: { in: uniqueAlternativeIds } },
        orderBy: { code: "asc" },
    });

    if (alternativesFromDb.length !== uniqueAlternativeIds.length) {
        throw new Error("Sebagian alternatif tidak ditemukan.");
    }

    // Step 1: Fetch evaluations only for selected alternatives.
    const evaluationRows = await prisma.evaluation.findMany({
        where: {
            alternativeId: { in: uniqueAlternativeIds },
        },
        select: {
            alternativeId: true,
            criteriaId: true,
            value: true,
        },
    });

    const criteria = criteriaFromDb.map((criterion, index) => {
        if (!isCriteriaType(criterion.type)) {
            throw new Error(
                `Tipe kriteria ${criterion.code} tidak valid. Gunakan BENEFIT atau COST.`
            );
        }

        return {
            id: criterion.id,
            code: criterion.code,
            name: criterion.name,
            type: criterion.type,
            weight: parsedWeights[index],
        };
    });

    const alternatives = alternativesFromDb.map((alternative) => ({
        id: alternative.id,
        code: alternative.code,
        name: alternative.name,
    }));

    return calculateMooraMatrix(alternatives, criteria, evaluationRows);
}

export async function calculateMooraFromForm(
    _previousState: PublicCalculationState,
    formData: FormData
): Promise<PublicCalculationState> {
    const selectedAlternativeIds = formData
        .getAll("alternativeIds")
        .map((entry) => parseInteger(entry))
        .filter((value): value is number => value !== null);

    const weights = formData
        .getAll("weights")
        .map((entry) => parseFloatValue(entry))
        .filter((value): value is number => value !== null);

    if (selectedAlternativeIds.length < 2) {
        return {
            error: "Pilih minimal 2 alternatif.",
            selectedAlternativeIds,
            weights,
        };
    }

    try {
        const result = await calculateMoora(selectedAlternativeIds, weights);
        const weightValidation = validateWeightVector(weights);

        return {
            error: undefined,
            weightInfo: weightValidation.message,
            selectedAlternativeIds,
            weights,
            result,
        };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menghitung MOORA.",
            selectedAlternativeIds,
            weights,
        };
    }
}

export async function loginAdminAction(
    _previousState: AuthActionState,
    formData: FormData
): Promise<AuthActionState> {
    await ensureDefaultAdmin();

    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
        return { error: "Username dan password wajib diisi." };
    }

    const verificationResult = await verifyAdminCredentials(username, password);
    if (!verificationResult.ok) {
        return { error: "Username atau password salah." };
    }

    const session = await getAdminSession();
    session.adminId = verificationResult.id;
    session.username = verificationResult.username;
    session.isLoggedIn = true;
    await session.save();

    redirect("/dashboard");
}

export async function logoutAdminAction() {
    const session = await getAdminSession();
    session.destroy();
    redirect("/login");
}

export async function createCriteriaAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const code = parseRequiredText(formData.get("code"), "Kode kriteria").toUpperCase();
        const name = parseRequiredText(formData.get("name"), "Nama kriteria");
        const type = parseCriteriaType(formData.get("type"));

        await prisma.criteria.create({
            data: {
                code,
                name,
                type,
            },
        });

        revalidatePath("/dashboard/kriteria");
        revalidatePath("/");
        return { success: true, message: "Kriteria berhasil ditambahkan." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan." };
    }
}

export async function updateCriteriaAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const id = parseInteger(formData.get("id"));
        if (!id) {
            throw new Error("ID kriteria tidak valid.");
        }

        const code = parseRequiredText(formData.get("code"), "Kode kriteria").toUpperCase();
        const name = parseRequiredText(formData.get("name"), "Nama kriteria");
        const type = parseCriteriaType(formData.get("type"));

        await prisma.criteria.update({
            where: { id },
            data: {
                code,
                name,
                type,
            },
        });

        revalidatePath("/dashboard/kriteria");
        revalidatePath("/");
        revalidatePath("/dashboard/hasil");
        return { success: true, message: "Kriteria berhasil diupdate." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal mengupdate." };
    }
}

export async function deleteCriteriaAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const id = parseInteger(formData.get("id"));
        if (!id) {
            throw new Error("ID kriteria tidak valid.");
        }

        await prisma.criteria.delete({ where: { id } });

        revalidatePath("/dashboard/kriteria");
        revalidatePath("/");
        revalidatePath("/dashboard/penilaian");
        revalidatePath("/dashboard/hasil");
        return { success: true, message: "Kriteria berhasil dihapus." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus." };
    }
}

export async function saveSubAlternativeAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const alternativeId = parseInteger(formData.get("alternativeId"));
        if (!alternativeId) {
            throw new Error("Alternatif tidak valid.");
        }

        const criteria = await prisma.criteria.findMany({
            select: { id: true },
        });

        const upsertQueries = criteria.map((criterion) => {
            const valStr = formData.get(`criteria_${criterion.id}_value`);
            const indStr = formData.get(`criteria_${criterion.id}_indicators`);
            
            const value = parseInteger(valStr) ?? 1;
            const indicatorIds = typeof indStr === "string" ? indStr : "[]";

            return prisma.evaluation.upsert({
                where: {
                    alternativeId_criteriaId: {
                        alternativeId,
                        criteriaId: criterion.id,
                    },
                },
                update: {
                    value,
                    indicatorIds,
                },
                create: {
                    alternativeId,
                    criteriaId: criterion.id,
                    value,
                    indicatorIds,
                },
            });
        });

        await prisma.$transaction(upsertQueries);

        revalidatePath("/dashboard/sub-alternatif");
        revalidatePath("/dashboard/penilaian");
        revalidatePath("/dashboard/hasil");
        revalidatePath("/");

        return { success: true, message: "Indikator sub alternatif dan normalisasi berhasil disimpan." };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Terjadi kesalahan.",
        };
    }
}

export async function createAlternativeAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const code = parseRequiredText(formData.get("code"), "Kode alternatif").toUpperCase();
        const name = parseRequiredText(formData.get("name"), "Nama alternatif");

        await prisma.alternative.create({
            data: {
                code,
                name,
            },
        });

        revalidatePath("/dashboard/alternatif");
        revalidatePath("/");
        revalidatePath("/dashboard/penilaian");
        return { success: true, message: "Alternatif berhasil ditambahkan." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan." };
    }
}

export async function updateAlternativeAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const id = parseInteger(formData.get("id"));
        if (!id) {
            throw new Error("ID alternatif tidak valid.");
        }

        const code = parseRequiredText(formData.get("code"), "Kode alternatif").toUpperCase();
        const name = parseRequiredText(formData.get("name"), "Nama alternatif");

        await prisma.alternative.update({
            where: { id },
            data: {
                code,
                name,
            },
        });

        revalidatePath("/dashboard/alternatif");
        revalidatePath("/");
        revalidatePath("/dashboard/penilaian");
        revalidatePath("/dashboard/hasil");
        return { success: true, message: "Alternatif berhasil diupdate." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal mengupdate." };
    }
}

export async function deleteAlternativeAction(_prevState: unknown, formData: FormData) {
    try {
        await requireAdmin();

        const id = parseInteger(formData.get("id"));
        if (!id) {
            throw new Error("ID alternatif tidak valid.");
        }

        await prisma.alternative.delete({ where: { id } });

        revalidatePath("/dashboard/alternatif");
        revalidatePath("/");
        revalidatePath("/dashboard/penilaian");
        revalidatePath("/dashboard/hasil");
        return { success: true, message: "Alternatif berhasil dihapus." };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus." };
    }
}

export async function saveAlternativeEvaluationsAction(
    _prevState: { success: boolean; error?: string },
    formData: FormData
) {
    try {
        await requireAdmin();

        const alternativeId = parseInteger(formData.get("alternativeId"));
        if (!alternativeId) {
            throw new Error("Alternatif tidak valid.");
        }

        const criteria = await prisma.criteria.findMany({ orderBy: { code: "asc" } });

        const upsertQueries = criteria.map((criterion) => {
            const value = parseInteger(formData.get(`criteria_${criterion.id}`));
            if (!value || value < 1 || value > 5) {
                throw new Error(
                    `Nilai untuk kriteria ${criterion.code} harus berupa angka 1 sampai 5.`
                );
            }

            return prisma.evaluation.upsert({
                where: {
                    alternativeId_criteriaId: {
                        alternativeId,
                        criteriaId: criterion.id,
                    },
                },
                update: {
                    value,
                },
                create: {
                    alternativeId,
                    criteriaId: criterion.id,
                    value,
                },
            });
        });

        await prisma.$transaction(upsertQueries);

        revalidatePath("/dashboard/penilaian");
        revalidatePath("/dashboard/hasil");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Terjadi kesalahan.",
        };
    }
}

export async function calculateAuditMoora() {
    await requireAdmin();

    const criteriaCount = await prisma.criteria.count();
    const auditWeights = getAuditWeights(criteriaCount);
    const alternatives = await prisma.alternative.findMany({ orderBy: { code: "asc" } });

    if (alternatives.length < 2 || criteriaCount === 0) {
        return {
            result: null,
            weights: auditWeights,
            message: "Data belum cukup untuk perhitungan audit.",
        };
    }

    const result = await calculateMoora(
        alternatives.map((alternative) => alternative.id),
        auditWeights
    );

    return {
        result,
        weights: auditWeights,
        message:
            criteriaCount === DEFAULT_AUDIT_WEIGHTS.length
                ? "Menggunakan bobot audit default 0.25, 0.15, 0.25, 0.10, 0.25."
                : "Jumlah kriteria bukan 5, bobot audit disesuaikan merata.",
    };
}