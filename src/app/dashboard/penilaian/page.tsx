import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { EvaluationForm } from "./evaluation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

interface PenilaianPageProps {
  searchParams: Promise<{
    alternativeId?: string;
  }>;
}

export default async function PenilaianPage({ searchParams }: PenilaianPageProps) {
  const params = await searchParams;

  const [alternatives, criteria, allEvaluations] = await Promise.all([
    prisma.alternative.findMany({ orderBy: { code: "asc" } }),
    prisma.criteria.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.evaluation.findMany(),
  ]);

  const selectedAlternativeId = Number.parseInt(params.alternativeId ?? "", 10);
  const selectedAlternative = alternatives.find(
    (alternative) => alternative.id === selectedAlternativeId
  ) ?? alternatives[0];

  const currentEvaluations = selectedAlternative
    ? allEvaluations.filter((e) => e.alternativeId === selectedAlternative.id)
    : [];

  const evaluationMap = new Map<number, number>();
  for (const evaluation of currentEvaluations) {
    evaluationMap.set(evaluation.criteriaId, evaluation.value);
  }

  // Matrix map for the table: key is `${altId}_${critId}`
  const matrixMap = new Map<string, number>();
  for (const evaluation of allEvaluations) {
    matrixMap.set(`${evaluation.alternativeId}_${evaluation.criteriaId}`, evaluation.value);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Matriks Penilaian Alternatif</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar nilai angka (skala 1-5) hasil normalisasi dari pengecekan indikator di menu Sub Alternatif. Anda juga dapat mengubah angka secara manual di bawah.
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
              <CardTitle>Matriks Keputusan (Hasil Normalisasi Indikator)</CardTitle>
              <CardDescription>
                Angka di bawah ini adalah hasil normalisasi otomatis setelah Anda memilih atau mencentang indikator di halaman Sub Alternatif.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Kode</TableHead>
                    <TableHead className="min-w-[180px]">Nama Jalan / Alternatif</TableHead>
                    {criteria.map((crit) => (
                      <TableHead key={crit.id} className="text-center min-w-[110px]">
                        <div>{crit.code}</div>
                        <div className="text-[10px] font-normal text-muted-foreground truncate max-w-[100px] mx-auto">
                          {crit.name}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right w-[160px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alternatives.map((alt) => (
                    <TableRow key={alt.id} className={selectedAlternative?.id === alt.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{alt.code}</TableCell>
                      <TableCell className="font-semibold">{alt.name}</TableCell>
                      {criteria.map((crit) => {
                        const val = matrixMap.get(`${alt.id}_${crit.id}`);
                        return (
                          <TableCell key={crit.id} className="text-center">
                            {val !== undefined ? (
                              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 font-bold text-primary text-sm">
                                {val}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Link href={`/dashboard/sub-alternatif?alternativeId=${alt.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <CheckSquare className="size-3.5 text-primary" />
                            Ubah Indikator
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pilih Alternatif untuk Ubah Angka Manual</CardTitle>
              <CardDescription>
                Gunakan form di bawah ini jika Anda ingin mengubah angka penilaian secara langsung tanpa mengubah centang indikator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-wrap items-end gap-3 mb-6">
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
                  Tampilkan Form Angka
                </Button>
              </form>

              {selectedAlternative ? (
                <div className="rounded-xl border p-5 bg-card">
                  <h3 className="font-semibold text-lg mb-4">
                    Ubah Angka Penilaian untuk {selectedAlternative.code} - {selectedAlternative.name}
                  </h3>
                  <EvaluationForm>
                    <input
                      type="hidden"
                      name="alternativeId"
                      value={selectedAlternative.id}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3" key={JSON.stringify(Array.from(evaluationMap.entries()))}>
                      {criteria.map((criterion) => {
                        const currentValue = evaluationMap.get(criterion.id);
                        return (
                          <div key={criterion.id} className="rounded-lg border p-4 bg-background">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-sm">
                                {criterion.code} - {criterion.name}
                              </p>
                              <Badge variant={criterion.type === "BENEFIT" ? "default" : "secondary"} className="text-[10px]">
                                {criterion.type}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground font-medium">
                                Nilai Angka (Skala 1 - 5):
                              </label>
                              <select
                                name={`criteria_${criterion.id}`}
                                defaultValue={currentValue?.toString() ?? "1"}
                                required
                                className="h-9 w-full rounded-lg border border-input bg-background px-3 font-semibold text-sm text-foreground focus:ring-2 focus:ring-primary"
                              >
                                <option value="5">5 - Sangat Baik / Sangat Tinggi</option>
                                <option value="4">4 - Baik / Lebih Baik</option>
                                <option value="3">3 - Cukup / Baik</option>
                                <option value="2">2 - Kurang Baik</option>
                                <option value="1">1 - Kurang / Tidak Baik</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </EvaluationForm>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
