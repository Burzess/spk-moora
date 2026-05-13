import { EvaluationForm } from "./evaluation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

interface PenilaianPageProps {
  searchParams: Promise<{
    alternativeId?: string;
  }>;
}

export default async function PenilaianPage({ searchParams }: PenilaianPageProps) {
  const params = await searchParams;

  const [alternatives, criteria] = await Promise.all([
    prisma.alternative.findMany({ orderBy: { code: "asc" } }),
    prisma.criteria.findMany({
      include: {
        subCriteria: {
          orderBy: [{ value: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  const selectedAlternativeId = Number.parseInt(params.alternativeId ?? "", 10);
  const selectedAlternative = alternatives.find(
    (alternative) => alternative.id === selectedAlternativeId
  );

  const currentEvaluations = selectedAlternative
    ? await prisma.evaluation.findMany({
        where: {
          alternativeId: selectedAlternative.id,
        },
      })
    : [];

  const evaluationMap = new Map<number, number>();
  for (const evaluation of currentEvaluations) {
    evaluationMap.set(evaluation.criteriaId, evaluation.value);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Input Penilaian Alternatif</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih satu alternatif, lalu isi nilai 1-5 sesuai sub-kriteria setiap
          kriteria.
        </p>
      </header>

      {alternatives.length === 0 || criteria.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Tambahkan data alternatif dan kriteria terlebih dahulu.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pilih Alternatif</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <div className="min-w-64 space-y-2">
                  <label htmlFor="alternativeId" className="text-sm font-medium">
                    Alternatif
                  </label>
                  <select
                    id="alternativeId"
                    name="alternativeId"
                    defaultValue={selectedAlternative?.id?.toString() ?? ""}
                    className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                    required
                  >
                    <option value="" disabled>
                      Pilih alternatif
                    </option>
                    {alternatives.map((alternative) => (
                      <option key={alternative.id} value={alternative.id}>
                        {alternative.code} - {alternative.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="outline">
                  Tampilkan Form
                </Button>
              </form>
            </CardContent>
          </Card>

          {selectedAlternative ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Penilaian untuk {selectedAlternative.code} - {selectedAlternative.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvaluationForm>
                  <input
                    type="hidden"
                    name="alternativeId"
                    value={selectedAlternative.id}
                  />

                  <div className="space-y-3" key={JSON.stringify(Array.from(evaluationMap.entries()))}>
                    {criteria.map((criterion) => {
                      const currentValue = evaluationMap.get(criterion.id);
                      return (
                        <div key={criterion.id} className="rounded-lg border p-3">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {criterion.code} - {criterion.name}
                            </p>
                            <Badge variant="outline">{criterion.type}</Badge>
                          </div>

                          {criterion.subCriteria.length > 0 ? (
                            <select
                              name={`criteria_${criterion.id}`}
                              defaultValue={currentValue?.toString() ?? ""}
                              required
                              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                            >
                              <option value="" disabled>
                                Pilih sub-kriteria
                              </option>
                              {criterion.subCriteria.map((sub) => (
                                <option key={sub.id} value={sub.value}>
                                  {sub.name} (nilai {sub.value})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              name={`criteria_${criterion.id}`}
                              type="number"
                              min={1}
                              max={5}
                              defaultValue={currentValue ?? 1}
                              required
                              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </EvaluationForm>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
