import { SubAlternativeForm } from "./sub-alternative-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

interface SubAlternatifPageProps {
  searchParams: Promise<{
    alternativeId?: string;
  }>;
}

export default async function SubAlternatifPage({ searchParams }: SubAlternatifPageProps) {
  const params = await searchParams;

  const [alternatives, criteria] = await Promise.all([
    prisma.alternative.findMany({ orderBy: { code: "asc" } }),
    prisma.criteria.findMany({
      include: {
        subAlternatives: {
          orderBy: [{ id: "asc" }],
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  const selectedAlternativeId = Number.parseInt(params.alternativeId ?? "", 10);
  const selectedAlternative = alternatives.find(
    (alternative) => alternative.id === selectedAlternativeId
  ) ?? alternatives[0];

  const currentEvaluations = selectedAlternative
    ? await prisma.evaluation.findMany({
        where: {
          alternativeId: selectedAlternative.id,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Penilaian Sub Alternatif (Indikator)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih nama jalan (alternatif), lalu centang atau pilih indikator yang terpenuhi. Sistem akan otomatis melakukan normalisasi menjadi nilai angka 1-5 untuk perhitungan MOORA.
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
              <CardTitle>Pilih Alternatif (Nama Jalan)</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <div className="min-w-64 space-y-2">
                  <label htmlFor="alternativeId" className="text-sm font-medium">
                    Alternatif / Jalan
                  </label>
                  <select
                    id="alternativeId"
                    name="alternativeId"
                    defaultValue={selectedAlternative?.id?.toString() ?? ""}
                    className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                    required
                  >
                    {alternatives.map((alternative) => (
                      <option key={alternative.id} value={alternative.id}>
                        {alternative.code} - {alternative.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="outline">
                  Tampilkan Indikator
                </Button>
              </form>
            </CardContent>
          </Card>

          {selectedAlternative ? (
            <SubAlternativeForm
              alternative={selectedAlternative}
              criteria={criteria}
              evaluations={currentEvaluations}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
