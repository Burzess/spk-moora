import { prisma } from "@/lib/prisma";
import { calculateAuditMoora } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const allAlternatives = await prisma.alternative.findMany({ orderBy: { code: "asc" } });

  if (!selectedIds || selectedIds.length === 0) {
    selectedIds = allAlternatives.map(a => a.id);
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
        <CardHeader>
          <CardTitle>Pilih Alternatif</CardTitle>
          <CardDescription>Pilih minimal 2 alternatif untuk dibandingkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {allAlternatives.map((alt) => {
                const isSelected = selectedIds?.includes(alt.id);
                return (
                  <label
                    key={alt.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-sm hover:bg-accent ${
                      isSelected ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="alt"
                      value={alt.id}
                      defaultChecked={isSelected}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm leading-none">{alt.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{alt.code}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button type="submit">Hitung Ranking</Button>
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
                          {row.indicators && row.indicators.length > 0 ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                                  Lihat ({row.indicators.length})
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Indikator: {row.alternativeName}</DialogTitle>
                                  <DialogDescription>
                                    Berikut adalah indikator yang dipenuhi oleh alternatif ini.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-wrap gap-2 mt-4 max-h-[60vh] overflow-y-auto">
                                  {row.indicators.map((indicator, idx) => (
                                    <Badge key={idx} variant="secondary" className="font-normal text-xs">
                                      {indicator}
                                    </Badge>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
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
