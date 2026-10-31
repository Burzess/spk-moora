import { prisma } from "@/lib/prisma";
import { calculateAuditMoora } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Circle, ListChecks, Info, DollarSign } from "lucide-react";
import { naturalSortByCode } from "@/lib/utils";
import { AlternativeFilter } from "./alternative-filter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export const dynamic = "force-dynamic";

export default async function HasilPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  let selectedIds: number[] | undefined = undefined;
  
  if (searchParams?.alt) {
    const alts = Array.isArray(searchParams.alt) ? searchParams.alt : [searchParams.alt];
    selectedIds = alts.map(a => parseInt(a, 10)).filter(n => !isNaN(n));
  }

  const [rawAlternatives, subAlternatives] = await Promise.all([
    prisma.alternative.findMany({ 
      include: {
        evaluations: {
          select: {
            indicatorIds: true,
            criteria: { select: { type: true } }
          }
        }
      }
    }),
    prisma.subAlternative.findMany({
      select: { id: true, name: true }
    })
  ]);

  const allAlternatives = naturalSortByCode(rawAlternatives);
  const subAltMap = new globalThis.Map(subAlternatives.map(sa => [sa.id, sa.name]));

  const formattedAlternatives = allAlternatives.map(alt => {
    const indicators: string[] = [];
    let rentalPrice: string | undefined = undefined;
    alt.evaluations.forEach(ev => {
      if (ev.criteria.type !== "COST" && ev.indicatorIds) {
        try {
          const ids = JSON.parse(ev.indicatorIds) as number[];
          const names = ids.map(id => subAltMap.get(id)).filter(Boolean) as string[];
          indicators.push(...names);
        } catch (e) {}
      } else if (ev.criteria.type === "COST" && ev.indicatorIds) {
        try {
          const parsed = JSON.parse(ev.indicatorIds);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
            rentalPrice = parsed[0];
          }
        } catch (e) {}
      }
    });
    return { ...alt, indicators, rentalPrice };
  });

  if (!selectedIds || selectedIds.length === 0) {
    selectedIds = formattedAlternatives.slice(0, 2).map(a => a.id);
  }

  const audit = await calculateAuditMoora(selectedIds);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Hasil Audit MOORA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih alternatif yang ingin di-ranking menggunakan bobot kriteria.
        </p>
      </header>

      <Card>
        <CardHeader className="bg-muted/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-500/15 text-blue-600 dark:text-blue-300">
              <MapPin className="h-5 w-5" />
            </div>
            <CardTitle className="font-heading text-xl">Pilih Alternatif</CardTitle>
          </div>
          <CardDescription className="ml-10">Pilih minimal 2 alternatif untuk dibandingkan dalam ranking.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AlternativeFilter
            alternatives={formattedAlternatives}
            initialSelectedIds={selectedIds}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bobot Audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{audit.message}</p>
          <div className="flex flex-wrap gap-2">
            {audit.weights.map((weight, index) => (
              <Badge key={index} variant="outline">
                C{index + 1}: {formatNumber(weight)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {audit.result ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ranking Akhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Rank</th>
                      <th className="px-2 py-2 text-left">Kode</th>
                      <th className="px-2 py-2 text-left">Alternatif</th>
                      <th className="px-2 py-2 text-center">Indikator</th>
                      <th className="px-2 py-2 text-right">Σ Benefit</th>
                      <th className="px-2 py-2 text-right">Σ Cost</th>
                      <th className="px-2 py-2 text-right">Yi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.result.ranking.map((row) => (
                      <tr key={row.alternativeId} className="border-b">
                        <td className="px-2 py-2 font-medium">{row.rank}</td>
                        <td className="px-2 py-2">{row.alternativeCode}</td>
                        <td className="px-2 py-2">
                          <div className="font-medium">{row.alternativeName}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                                Lihat ({(row.indicators || []).length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                  <ListChecks className="size-5 text-primary" />
                                  Detail: {row.alternativeName}
                                </DialogTitle>
                                <DialogDescription>
                                  Berikut adalah rincian harga sewa dan indikator untuk alternatif ini.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 max-h-[60vh] overflow-y-auto p-1">
                                {row.rentalPrice && (
                                  <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20 shadow-xs">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                        <DollarSign className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Harga Sewa Lokasi</p>
                                        <p className="text-base font-bold text-foreground">{row.rentalPrice}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 text-[11px]">
                                      Biaya Sewa
                                    </Badge>
                                  </div>
                                )}

                                {(row.indicators || []).length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(row.indicators || []).map((indicator, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                                          <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium leading-tight text-foreground/90">{indicator}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                                    <Info className="size-8 text-muted-foreground/50 mb-3" />
                                    <span className="text-sm font-medium text-muted-foreground">Tidak ada indikator benefit lainnya.</span>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                        <td className="px-2 py-2 text-right">{formatNumber(row.benefitSum)}</td>
                        <td className="px-2 py-2 text-right">{formatNumber(row.costSum)}</td>
                        <td className="px-2 py-2 text-right font-semibold">{formatNumber(row.yi)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matriks Keputusan (Decision Matrix)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Alternatif</th>
                      {audit.result.criteria.map((criterion) => (
                        <th key={criterion.id} className="px-2 py-2 text-right">
                          {criterion.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audit.result.decisionMatrix.map((row, rowIndex) => (
                      <tr key={audit.result!.alternatives[rowIndex].id} className="border-b">
                        <td className="px-2 py-2">
                          {audit.result!.alternatives[rowIndex].code} -{" "}
                          {audit.result!.alternatives[rowIndex].name}
                        </td>
                        {row.map((value, columnIndex) => (
                          <td key={columnIndex} className="px-2 py-2 text-right font-mono text-xs">
                            {formatNumber(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matriks Normalisasi (Normalized Matrix)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Alternatif</th>
                      {audit.result.criteria.map((criterion) => (
                        <th key={criterion.id} className="px-2 py-2 text-right">
                          {criterion.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audit.result.normalizedMatrix.map((row, rowIndex) => (
                      <tr key={audit.result!.alternatives[rowIndex].id} className="border-b">
                        <td className="px-2 py-2">
                          {audit.result!.alternatives[rowIndex].code} -{" "}
                          {audit.result!.alternatives[rowIndex].name}
                        </td>
                        {row.map((value, columnIndex) => (
                          <td key={columnIndex} className="px-2 py-2 text-right font-mono text-xs">
                            {formatNumber(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matriks Normalisasi Berbobot (Weighted Normalized Matrix)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Alternatif</th>
                      {audit.result.criteria.map((criterion) => (
                        <th key={criterion.id} className="px-2 py-2 text-right">
                          {criterion.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audit.result.weightedMatrix.map((row, rowIndex) => (
                      <tr key={audit.result!.alternatives[rowIndex].id} className="border-b">
                        <td className="px-2 py-2">
                          {audit.result!.alternatives[rowIndex].code} -{" "}
                          {audit.result!.alternatives[rowIndex].name}
                        </td>
                        {row.map((value, columnIndex) => (
                          <td key={columnIndex} className="px-2 py-2 text-right font-mono text-xs">
                            {formatNumber(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            {audit.message}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
