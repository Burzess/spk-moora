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
                        <td className="px-2 py-2">{row.alternativeName}</td>
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
              <CardTitle>Matriks Normalisasi Berbobot</CardTitle>
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
                      <tr key={audit.result.alternatives[rowIndex].id} className="border-b">
                        <td className="px-2 py-2">
                          {audit.result.alternatives[rowIndex].code} -{" "}
                          {audit.result.alternatives[rowIndex].name}
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
