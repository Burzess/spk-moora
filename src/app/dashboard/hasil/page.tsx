import { prisma } from "@/lib/prisma";
import { calculateAuditMoora } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Circle, ListChecks, Info } from "lucide-react";
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

  const [allAlternatives, subAlternatives] = await Promise.all([
    prisma.alternative.findMany({ 
      orderBy: { code: "asc" },
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

  const subAltMap = new globalThis.Map(subAlternatives.map(sa => [sa.id, sa.name]));

  const formattedAlternatives = allAlternatives.map(alt => {
    const indicators: string[] = [];
    alt.evaluations.forEach(ev => {
      if (ev.criteria.type !== "COST" && ev.indicatorIds) {
        try {
          const ids = JSON.parse(ev.indicatorIds) as number[];
          const names = ids.map(id => subAltMap.get(id)).filter(Boolean) as string[];
          indicators.push(...names);
        } catch (e) {}
      }
    });
    return { ...alt, indicators };
  });

  if (!selectedIds || selectedIds.length === 0) {
    selectedIds = formattedAlternatives.map(a => a.id);
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
          <form method="GET" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {formattedAlternatives.map((alt) => {
                const isSelected = selectedIds?.includes(alt.id);
                return (
                  <label
                    key={alt.id}
                    className="group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-border bg-card/50 hover:border-blue-500/50 has-[:checked]:border-blue-400/60 has-[:checked]:bg-blue-500/10 has-[:checked]:ring-1 has-[:checked]:ring-blue-400/25 flex flex-col h-full gap-2"
                  >
                    <input
                      type="checkbox"
                      name="alt"
                      value={alt.id}
                      defaultChecked={isSelected}
                      className="sr-only"
                    />
                    <div className="flex flex-col h-full gap-2">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-0.5 shrink-0 transition-colors">
                          <Circle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 group-has-[:checked]:hidden" />
                          <CheckCircle2 className="h-5 w-5 text-blue-600 hidden group-has-[:checked]:block" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-1.5 font-mono text-xs text-muted-foreground">
                            {alt.code}
                          </Badge>
                          <p className="font-medium leading-tight text-foreground/90 group-has-[:checked]:text-blue-900 group-has-[:checked]:dark:text-blue-100">
                            {alt.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto border-t border-border/60 pt-2 pl-9 flex items-center gap-3">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alt.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          <MapPin className="h-3 w-3" />
                          Maps
                        </a>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-transparent dark:text-blue-300 dark:hover:text-blue-200">
                              Lihat Indikator ({(alt.indicators || []).length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                              <ListChecks className="size-5 text-primary" />
                              Indikator - {alt.name}
                            </DialogTitle>
                            <DialogDescription>
                              Daftar indikator (benefit) yang terpenuhi untuk alternatif ini.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-2">
                            {(alt.indicators || []).length > 0 ? (
                              <ul className="space-y-3">
                                {(alt.indicators || []).map((ind, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 bg-muted/50 p-3 rounded-lg border border-border/50">
                                    <CheckCircle2 className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                                    <span className="leading-snug">{ind}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                                <Info className="size-10 text-muted-foreground/50 mb-3" />
                                <span className="text-sm font-medium text-muted-foreground">Tidak ada indikator benefit.</span>
                                <span className="text-xs text-muted-foreground/70 mt-1">Alternatif ini belum memiliki atau hanya memenuhi indikator cost.</span>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold">Hitung Ranking</Button>
            </div>
          </form>
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
                                  Indikator: {row.alternativeName}
                                </DialogTitle>
                                <DialogDescription>
                                  Berikut adalah indikator yang dipenuhi oleh alternatif ini.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                {(row.indicators || []).length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {(row.indicators || []).map((indicator, idx) => (
                                      <Badge key={idx} variant="outline" className="font-normal text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-2.5 py-1">
                                        <CheckCircle2 className="size-3 mr-1.5 inline-block" />
                                        {indicator}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                                    <Info className="size-8 text-muted-foreground/50 mb-3" />
                                    <span className="text-sm font-medium text-muted-foreground">Tidak ada indikator benefit.</span>
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
