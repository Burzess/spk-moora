import { calculateAuditMoora } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export default async function HasilPage() {
  const audit = await calculateAuditMoora();

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Hasil Audit MOORA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perhitungan menggunakan seluruh alternatif dalam database.
        </p>
      </header>

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
                          {row.indicators && row.indicators.length > 0 && (
                            <details className="mt-1 group">
                              <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
                                <span className="border-b border-dashed border-muted-foreground/50 pb-0.5 group-open:border-transparent transition-colors">
                                  Lihat Indikator ({row.indicators.length})
                                </span>
                              </summary>
                              <div className="mt-2 flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1">
                                {row.indicators.map((indicator, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </details>
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
