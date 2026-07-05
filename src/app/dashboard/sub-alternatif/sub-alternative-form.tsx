"use client";

import { useState } from "react";
import { CheckSquare, Square, CheckCircle2 } from "lucide-react";
import { saveSubAlternativeAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SubAlternativeFormProps {
  alternative: {
    id: number;
    code: string;
    name: string;
  };
  criteria: Array<{
    id: number;
    code: string;
    name: string;
    type: string;
    subCriteria: Array<{
      id: number;
      name: string;
      value: number;
    }>;
  }>;
  evaluations: Array<{
    id: number;
    criteriaId: number;
    value: number;
    indicatorIds?: string | null;
  }>;
}

export function SubAlternativeForm({
  alternative,
  criteria,
  evaluations,
}: SubAlternativeFormProps) {
  // Initialize checked state per criteria
  const [selectedIndicators, setSelectedIndicators] = useState<Record<number, number[]>>(() => {
    const initial: Record<number, number[]> = {};

    for (const criterion of criteria) {
      const evalItem = evaluations.find((e) => e.criteriaId === criterion.id);
      if (evalItem && evalItem.indicatorIds) {
        try {
          const parsed = JSON.parse(evalItem.indicatorIds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initial[criterion.id] = parsed;
            continue;
          }
        } catch {
          // fallback below
        }
      }

      // If no indicatorIds saved yet, infer from evalItem.value or set defaults
      if (evalItem) {
        const val = evalItem.value;
        if (criterion.type === "BENEFIT") {
          // For benefit (3 indicators): val 5 -> 3 checked, val 3 -> 2 checked, val 1 -> 1 checked
          const count = val >= 5 ? 3 : val >= 3 ? 2 : 1;
          initial[criterion.id] = criterion.subCriteria.slice(0, count).map((sub) => sub.id);
        } else {
          // For cost (Biaya sewa, 5 options): pick option index val-1
          const idx = Math.max(0, Math.min(val - 1, criterion.subCriteria.length - 1));
          if (criterion.subCriteria[idx]) {
            initial[criterion.id] = [criterion.subCriteria[idx].id];
          } else {
            initial[criterion.id] = criterion.subCriteria.slice(0, 1).map((s) => s.id);
          }
        }
      } else {
        // Default: first indicator checked
        initial[criterion.id] = criterion.subCriteria.slice(0, 1).map((s) => s.id);
      }
    }

    return initial;
  });

  const toggleIndicator = (criteriaId: number, indicatorId: number, isCost: boolean) => {
    setSelectedIndicators((prev) => {
      const current = prev[criteriaId] || [];
      if (isCost) {
        // Single select for COST (Biaya Sewa ranges)
        return { ...prev, [criteriaId]: [indicatorId] };
      } else {
        // Multi select checkboxes for BENEFIT indicators
        if (current.includes(indicatorId)) {
          // Keep at least 1 checked or allow 0
          const updated = current.filter((id) => id !== indicatorId);
          return { ...prev, [criteriaId]: updated };
        } else {
          return { ...prev, [criteriaId]: [...current, indicatorId] };
        }
      }
    });
  };

  // Compute normalized score based on user instructions and excel scale
  const getNormalizedScore = (criterion: SubAlternativeFormProps["criteria"][0]) => {
    const checked = selectedIndicators[criterion.id] || [];
    if (criterion.type === "COST") {
      // For Biaya Sewa: find selected subCriteria index
      if (checked.length === 0) return 1;
      const idx = criterion.subCriteria.findIndex((sub) => sub.id === checked[0]);
      return idx !== -1 ? idx + 1 : 1;
    } else {
      // For BENEFIT (3 indicators): 3 checked -> 5 (Sangat Baik), 2 checked -> 3 (Baik), <=1 checked -> 1 (Kurang)
      const count = checked.length;
      if (count >= 3) return 5;
      if (count === 2) return 3;
      return 1;
    }
  };

  const getScoreLabel = (criterion: SubAlternativeFormProps["criteria"][0], score: number) => {
    if (criterion.type === "COST") {
      if (score === 1) return "Sangat Baik (≤ 20% / ≤ Rp 500.000)";
      if (score === 2) return "Lebih Baik (> 20% – 40%)";
      if (score === 3) return "Cukup Baik (> 40% – 60%)";
      if (score === 4) return "Kurang Baik (> 60% – 80%)";
      return "Tidak Baik (> 80% / > Rp 1.400.001)";
    } else {
      if (score === 5) return "Sangat Baik (3 Indikator Terpenuhi)";
      if (score === 3) return "Baik (2 Indikator Terpenuhi)";
      return "Kurang (≤ 1 Indikator Terpenuhi)";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Indikator untuk Alternatif: <span className="text-primary">{alternative.code} - {alternative.name}</span>
        </CardTitle>
        <CardDescription>
          Centang indikator kondisi nyata di lokasi <span className="font-semibold">{alternative.name}</span>. Nilai akan otomatis dinormalisasi menjadi angka skala 1-5.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActionForm action={saveSubAlternativeAction} className="space-y-6">
          <input type="hidden" name="alternativeId" value={alternative.id} />

          <div className="grid gap-6">
            {criteria.map((criterion) => {
              const isCost = criterion.type === "COST";
              const checkedIds = selectedIndicators[criterion.id] || [];
              const normalizedScore = getNormalizedScore(criterion);
              const scoreLabel = getScoreLabel(criterion, normalizedScore);

              return (
                <div
                  key={criterion.id}
                  className="rounded-xl border bg-card p-5 transition-all hover:border-primary/40 shadow-sm"
                >
                  <input
                    type="hidden"
                    name={`criteria_${criterion.id}_value`}
                    value={normalizedScore}
                  />
                  <input
                    type="hidden"
                    name={`criteria_${criterion.id}_indicators`}
                    value={JSON.stringify(checkedIds)}
                  />

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
                        {criterion.code}
                      </span>
                      <h3 className="font-semibold text-base">{criterion.name}</h3>
                      <Badge variant={isCost ? "secondary" : "default"} className="ml-1 text-xs">
                        {criterion.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 border border-primary/20">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        Normalisasi: <span className="text-primary font-bold text-sm">{normalizedScore}</span> ({scoreLabel})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {isCost
                        ? "Pilih rentang persentase / biaya sewa:"
                        : "Centang indikator yang terpenuhi di lokasi ini:"}
                    </p>

                    {criterion.subCriteria.map((sub, index) => {
                      const isChecked = checkedIds.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => toggleIndicator(criterion.id, sub.id, isCost)}
                          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                            isChecked
                              ? "border-primary bg-primary/5 text-foreground font-medium shadow-xs"
                              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-primary flex-shrink-0">
                            {isCost ? (
                              <div
                                className={`size-4 rounded-full border flex items-center justify-center ${
                                  isChecked ? "border-primary bg-primary" : "border-muted-foreground"
                                }`}
                              >
                                {isChecked && <div className="size-1.5 rounded-full bg-background" />}
                              </div>
                            ) : isChecked ? (
                              <CheckSquare className="size-5 text-primary" />
                            ) : (
                              <Square className="size-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm select-none">
                            {sub.name}
                            {isCost && (
                              <span className="ml-2 text-xs font-semibold text-primary">
                                (Skor: {index + 1})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <SubmitButton size="lg" className="px-8 font-semibold shadow-md">
              Simpan Indikator & Normalisasi Penilaian
            </SubmitButton>
          </div>
        </ActionForm>
      </CardContent>
    </Card>
  );
}
