"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { updateAllCriteriaWeightsAction } from "@/app/actions";

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

interface Criteria {
  id: number;
  code: string;
  name: string;
  type: string;
  weight: number;
}

export function WeightsForm({ criteria }: { criteria: Criteria[] }) {
  const [weights, setWeights] = useState<number[]>(criteria.map(c => c.weight));
  
  const totalWeight = weights.reduce((acc, val) => acc + (val || 0), 0);

  return (
    <ActionForm action={updateAllCriteriaWeightsAction} className="space-y-6">
      <div className="mb-2 flex gap-3 flex-wrap">
        <Badge variant="default" className="text-sm bg-emerald-500 hover:bg-emerald-600">
          Total input: {formatNumber(totalWeight)}
        </Badge>
        <Badge variant="outline" className="text-sm">
          Total Normalisasi: {totalWeight > 0 ? "1.0000 (100%)" : "0.0000"}
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {criteria.map((criterion, index) => {
          const weightValue = weights[index] || 0;
          const normalizedWeight = totalWeight > 0 ? weightValue / totalWeight : 0;
          
          return (
            <div key={criterion.id} className="group rounded-xl border border-border/70 bg-card/50 p-4 transition-all hover:border-emerald-400/40 hover:shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-300">
                    {criterion.code}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-tight text-foreground">
                    {criterion.name}
                  </p>
                </div>
                <Badge variant={criterion.type === "BENEFIT" ? "default" : "destructive"} className="text-[10px] uppercase tracking-wider">
                  {criterion.type}
                </Badge>
              </div>
              <div className="mt-auto pt-2 space-y-2">
                <Input
                  name={`weight_${criterion.id}`}
                  type="number"
                  step="any"
                  min="0"
                  value={weights[index] === 0 ? "" : weights[index]}
                  placeholder="misal: 80"
                  onChange={(e) => {
                    const newWeights = [...weights];
                    newWeights[index] = parseFloat(e.target.value) || 0;
                    setWeights(newWeights);
                  }}
                  required
                  className="h-9 focus-visible:ring-emerald-500"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Hasil Normalisasi:</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {formatNumber(normalizedWeight)} ({(normalizedWeight * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <SubmitButton>Simpan Bobot</SubmitButton>
      </div>
    </ActionForm>
  );
}
