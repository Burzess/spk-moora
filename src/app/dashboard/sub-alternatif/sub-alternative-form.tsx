"use client";

import { useState } from "react";
import { CheckSquare, Square, CheckCircle2, DollarSign } from "lucide-react";
import { saveSubAlternativeAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateCostScore, getCostScoreLabel } from "@/lib/utils";

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
    subAlternatives: Array<{
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

function formatRupiahNumber(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(clean, 10));
}

export function SubAlternativeForm({
  alternative,
  criteria,
  evaluations,
}: SubAlternativeFormProps) {
  // Initialize checked state for BENEFIT criteria
  const [selectedIndicators, setSelectedIndicators] = useState<Record<number, number[]>>(() => {
    const initial: Record<number, number[]> = {};

    for (const criterion of criteria) {
      if (criterion.type === "COST") continue;

      const evalItem = evaluations.find((e) => e.criteriaId === criterion.id);
      if (evalItem && evalItem.indicatorIds) {
        try {
          const parsed = JSON.parse(evalItem.indicatorIds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter only valid numeric IDs for sub-alternatives
            const numIds = parsed.filter((item): item is number => typeof item === "number");
            if (numIds.length > 0) {
              initial[criterion.id] = numIds;
              continue;
            }
          }
        } catch {
          // fallback below
        }
      }

      if (evalItem) {
        const val = evalItem.value;
        const count = val >= 3 ? 3 : val === 2 ? 2 : 1;
        initial[criterion.id] = criterion.subAlternatives.slice(0, count).map((sub) => sub.id);
      } else {
        initial[criterion.id] = criterion.subAlternatives.slice(0, 1).map((s) => s.id);
      }
    }

    return initial;
  });

  // Initialize rental price input state for COST criteria
  const [costPrices, setCostPrices] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};

    for (const criterion of criteria) {
      if (criterion.type !== "COST") continue;

      const evalItem = evaluations.find((e) => e.criteriaId === criterion.id);
      if (evalItem && evalItem.indicatorIds) {
        try {
          const parsed = JSON.parse(evalItem.indicatorIds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const first = parsed[0];
            if (typeof first === "string") {
              initial[criterion.id] = formatRupiahNumber(first);
              continue;
            } else if (typeof first === "number") {
              // If it was a subAlternative ID previously, find its name or fallback
              const sub = criterion.subAlternatives.find((s) => s.id === first);
              if (sub) {
                initial[criterion.id] = formatRupiahNumber(sub.name);
                continue;
              }
            }
          }
        } catch {
          // If plain text was stored
          initial[criterion.id] = formatRupiahNumber(evalItem.indicatorIds);
          continue;
        }
      }

      // Default empty if not set
      initial[criterion.id] = "";
    }

    return initial;
  });

  const toggleBenefitIndicator = (criteriaId: number, indicatorId: number) => {
    setSelectedIndicators((prev) => {
      const current = prev[criteriaId] || [];
      if (current.includes(indicatorId)) {
        const updated = current.filter((id) => id !== indicatorId);
        return { ...prev, [criteriaId]: updated };
      } else {
        return { ...prev, [criteriaId]: [...current, indicatorId] };
      }
    });
  };

  const handleCostPriceChange = (criteriaId: number, value: string) => {
    const formatted = formatRupiahNumber(value);
    setCostPrices((prev) => ({
      ...prev,
      [criteriaId]: formatted,
    }));
  };

  // Compute normalized score based on user instructions and scale
  const getNormalizedScore = (criterion: SubAlternativeFormProps["criteria"][0]) => {
    if (criterion.type === "COST") {
      const costValue = costPrices[criterion.id] ?? "";
      return calculateCostScore(costValue);
    } else {
      // For BENEFIT (3 indicators): 3 checked -> 3 (Sangat Baik), 2 checked -> 2 (Baik), <=1 checked -> 1 (Kurang)
      const checked = selectedIndicators[criterion.id] || [];
      const count = checked.length;
      if (count >= 3) return 3;
      if (count === 2) return 2;
      return 1;
    }
  };

  const getScoreLabel = (criterion: SubAlternativeFormProps["criteria"][0], score: number) => {
    if (criterion.type === "COST") {
      return getCostScoreLabel(score);
    } else {
      if (score === 3) return "Sangat Baik (3 Indikator Terpenuhi)";
      if (score === 2) return "Baik (2 Indikator Terpenuhi)";
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
          Isi harga sewa untuk kriteria Biaya Sewa dan centang indikator kondisi nyata di lokasi <span className="font-semibold">{alternative.name}</span>. Nilai akan otomatis dinormalisasi untuk perhitungan MOORA.
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
              const costValue = costPrices[criterion.id] ?? "";

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
                    value={
                      isCost
                        ? JSON.stringify(costValue.trim() ? [`Rp ${costValue.trim()}`] : [])
                        : JSON.stringify(checkedIds)
                    }
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

                  {isCost ? (
                    <div className="space-y-3">
                      <Label
                        htmlFor={`cost_input_${criterion.id}`}
                        className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                      >
                        <DollarSign className="size-3.5 text-primary" />
                        Input Harga Sewa di Lokasi Ini:
                      </Label>
                      <div className="flex max-w-md items-center rounded-lg border border-input bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary">
                        <span className="flex h-10 items-center justify-center border-r border-input bg-muted/60 px-3.5 text-sm font-semibold text-muted-foreground select-none">
                          Rp
                        </span>
                        <Input
                          id={`cost_input_${criterion.id}`}
                          type="text"
                          inputMode="numeric"
                          value={costValue}
                          onChange={(e) => handleCostPriceChange(criterion.id, e.target.value)}
                          placeholder="misal: 1.000.000"
                          className="h-10 border-0 shadow-none focus-visible:ring-0 text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>Rentang Skala Penilaian Biaya Sewa:</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                          <div className={`p-1.5 rounded-md border transition-colors ${normalizedScore === 1 ? "bg-primary/10 border-primary font-semibold text-primary" : "bg-card/50 border-border"}`}>
                            • ≤ Rp 500.000 $\rightarrow$ <span className="font-bold">Nilai 1</span>
                          </div>
                          <div className={`p-1.5 rounded-md border transition-colors ${normalizedScore === 2 ? "bg-primary/10 border-primary font-semibold text-primary" : "bg-card/50 border-border"}`}>
                            • Rp 500.001 - 800.000 $\rightarrow$ <span className="font-bold">Nilai 2</span>
                          </div>
                          <div className={`p-1.5 rounded-md border transition-colors ${normalizedScore === 3 ? "bg-primary/10 border-primary font-semibold text-primary" : "bg-card/50 border-border"}`}>
                            • Rp 800.001 - 1.100.000 $\rightarrow$ <span className="font-bold">Nilai 3</span>
                          </div>
                          <div className={`p-1.5 rounded-md border transition-colors ${normalizedScore === 4 ? "bg-primary/10 border-primary font-semibold text-primary" : "bg-card/50 border-border"}`}>
                            • Rp 1.100.001 - 1.400.000 $\rightarrow$ <span className="font-bold">Nilai 4</span>
                          </div>
                          <div className={`p-1.5 rounded-md border transition-colors ${normalizedScore === 5 ? "bg-primary/10 border-primary font-semibold text-primary" : "bg-card/50 border-border"}`}>
                            • &gt; Rp 1.400.000 $\rightarrow$ <span className="font-bold">Nilai 5</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          * Input angka otomatis diformat ribuan. Skor normalisasi matriks MOORA untuk kriteria ini adalah <span className="font-bold text-primary">{normalizedScore}</span> ({scoreLabel}).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Centang indikator yang terpenuhi di lokasi ini:
                      </p>

                      {criterion.subAlternatives.map((sub) => {
                        const isChecked = checkedIds.includes(sub.id);
                        return (
                          <div
                            key={sub.id}
                            onClick={() => toggleBenefitIndicator(criterion.id, sub.id)}
                            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                              isChecked
                                ? "border-primary bg-primary/5 text-foreground font-medium shadow-xs"
                                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                            }`}
                          >
                            <div className="text-primary flex-shrink-0">
                              {isChecked ? (
                                <CheckSquare className="size-5 text-primary" />
                              ) : (
                                <Square className="size-5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-sm select-none">
                              {sub.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

