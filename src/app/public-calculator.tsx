"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  MapPin,
  SlidersHorizontal,
  Calculator,
  Trophy,
  Medal,
  RefreshCw
} from "lucide-react";

import {
  calculateMooraFromForm,
  type PublicCalculationState,
} from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PublicCalculatorProps {
  criteria: Array<{
    id: number;
    code: string;
    name: string;
    type: string;
  }>;
  alternatives: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  initialWeights: number[];
}

const initialState: PublicCalculationState = {};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-zinc-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="flex h-5 w-5 items-center justify-center font-semibold text-muted-foreground">{rank}</span>;
}

export function PublicCalculator({
  criteria,
  alternatives,
  initialWeights,
}: PublicCalculatorProps) {

  const [selectedIds, setSelectedIds] = useState<number[]>(
    alternatives.slice(0, 2).map((alternative) => alternative.id)
  );
  const [weights, setWeights] = useState<number[]>(initialWeights);

  const [state, formAction, isPending] = useActionState(
    calculateMooraFromForm,
    initialState
  );

  const selectedCount = selectedIds.length;
  const totalWeight = useMemo(
    () => weights.reduce((sum, weight) => sum + (Number.isFinite(weight) ? weight : 0), 0),
    [weights]
  );

  function toggleAlternative(alternativeId: number) {
    setSelectedIds((previous) => {
      if (previous.includes(alternativeId)) {
        if (previous.length <= 2) {
          return previous;
        }
        return previous.filter((id) => id !== alternativeId);
      }

      return [...previous, alternativeId];
    });
  }

  function updateWeight(index: number, value: string) {
    const parsed = Number.parseFloat(value);
    setWeights((previous) =>
      previous.map((weight, currentIndex) =>
        currentIndex === index ? (Number.isFinite(parsed) ? parsed : 0) : weight
      )
    );
  }

  function normalizeWeights() {
    if (weights.length === 0) {
      return;
    }

    const sum = weights.reduce((accumulator, value) => accumulator + value, 0);
    if (sum <= 0) {
      const equalWeight = 1 / weights.length;
      setWeights(weights.map(() => equalWeight));
      return;
    }

    setWeights(weights.map((value) => value / sum));
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-8">
        <Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="bg-muted/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-500/15 text-blue-600 dark:text-blue-300">
                <MapPin className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-xl">1. Pilih Alternatif Lokasi</CardTitle>
            </div>
            <CardDescription className="ml-10">
              Pilih minimal 2 lokasi yang ingin dibandingkan untuk mendapatkan rekomendasi terbaik.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center gap-3">
              <Badge variant="secondary" className="border border-blue-400/25 bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-200">
                {selectedCount} lokasi dipilih
              </Badge>
              <p className="text-sm text-muted-foreground">
                Klik pada kartu untuk memilih atau membatalkan pilihan.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alternative) => {
                const isSelected = selectedIds.includes(alternative.id);

                return (
                  <div
                    key={alternative.id}
                    className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isSelected
                        ? "border-blue-400/60 bg-blue-500/10 ring-1 ring-blue-400/25"
                        : "border-border bg-card/50 hover:border-blue-500/50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="alternativeIds"
                      value={alternative.id}
                      checked={isSelected}
                      readOnly
                      className="sr-only"
                    />
                    <div className="flex flex-col h-full gap-2">
                      <div
                        className="flex items-start gap-4 cursor-pointer flex-1"
                        onClick={() => toggleAlternative(alternative.id)}
                      >
                        <div className="mt-0.5 shrink-0 transition-colors">
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-1.5 font-mono text-xs text-muted-foreground">
                            {alternative.code}
                          </Badge>
                          <p className={`font-medium leading-tight ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-foreground/90"}`}>
                            {alternative.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-border/60 pt-2 pl-9">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alternative.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          <MapPin className="h-3 w-3" />
                          Buka di Maps
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="bg-muted/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-xl">2. Atur Bobot Kriteria</CardTitle>
            </div>
            <CardDescription className="ml-10">
              Sesuaikan bobot prioritas untuk setiap kriteria. Total bobot 1.0 direkomendasikan agar proporsional.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {(() => {
                const diff = totalWeight - 1.0;
                const isWeightValid = (diff < 0 ? -diff : diff) < 0.001;
                return (
                  <Badge
                    variant={isWeightValid ? "default" : "secondary"}
                    className={`text-sm ${isWeightValid ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                  >
                    Total bobot: {formatNumber(totalWeight)}
                  </Badge>
                );
              })()}
              <Button type="button" variant="outline" size="sm" onClick={normalizeWeights} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Normalisasi Otomatis ke 1.0
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {criteria.map((criterion, index) => (
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
                  <div className="mt-auto pt-2">
                    <Input
                      name="weights"
                      type="number"
                      step="any"
                      min="0"
                      value={weights[index] ?? 0}
                      onChange={(event) => updateWeight(index, event.target.value)}
                      required
                      className="h-9 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-blue-400/35 bg-blue-500/10 shadow-md">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/85 text-white shadow-lg">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">Hitung Peringkat MOORA</h3>
              <p className="mt-2 mb-6 max-w-lg text-sm text-muted-foreground">
                Sistem akan memproses data alternatif yang Anda pilih menggunakan bobot yang telah ditentukan dengan metode MOORA.
              </p>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                disabled={isPending || selectedCount < 2}
              >
                {isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Menghitung...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-5 w-5" />
                    Mulai Perhitungan
                  </>
                )}
              </Button>

              {state.error && (
                <div className="mt-4 w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p>{state.error}</p>
                </div>
              )}

              {state.weightInfo && (
                <div className="mt-4 w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
                  <p className="font-semibold">Informasi Bobot</p>
                  <p>{state.weightInfo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {state.result && (
        <div id="result-section" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden border-emerald-200 dark:border-emerald-400/35 shadow-lg">
            <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl text-emerald-900 dark:text-emerald-100">Hasil Peringkat</CardTitle>
                  <CardDescription className="text-emerald-700/70 dark:text-emerald-200/80">
                    Berdasarkan {selectedCount} alternatif yang dipilih
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[80px] text-center font-semibold text-foreground/80">Rank</TableHead>
                    <TableHead className="w-[100px] font-semibold text-foreground/80">Kode</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Alternatif</TableHead>
                    <TableHead className="text-right font-semibold text-foreground/80">Σ Benefit</TableHead>
                    <TableHead className="text-right font-semibold text-foreground/80">Σ Cost</TableHead>
                    <TableHead className="w-[120px] text-right font-bold text-emerald-700 dark:text-emerald-300">Skor (Yi)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.result.ranking.map((row) => (
                    <TableRow
                      key={row.alternativeId}
                      className={row.rank === 1 ? "bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/15" : ""}
                    >
                      <TableCell className="text-center font-medium">
                        <div className="flex justify-center">
                          <RankIcon rank={row.rank} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {row.alternativeCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${row.rank === 1 ? "text-amber-900 dark:text-amber-200" : "text-foreground/90"}`}>
                          {row.alternativeName}
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.alternativeName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          <MapPin className="h-3 w-3" />
                          Lihat Peta
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        +{formatNumber(row.benefitSum)}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        -{formatNumber(row.costSum)}
                      </TableCell>
                      <TableCell className="text-right text-lg font-bold text-foreground">
                        {formatNumber(row.yi)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-border/60 bg-muted/30 p-4 text-center">
                <p className="mx-auto max-w-2xl text-xs text-muted-foreground">
                  Nilai Skor (Yi) dihitung dengan mengurangkan total nilai kriteria biaya (Cost) dari total nilai kriteria keuntungan (Benefit) setelah matriks keputusan dinormalisasi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
