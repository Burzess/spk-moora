import Link from "next/link";
import { CheckSquare } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { WeightsForm } from "./weights-form";
import { naturalSortByCode } from "@/lib/utils";

export default async function PenilaianPage() {
  const [rawAlternatives, rawCriteria, allEvaluations] = await Promise.all([
    prisma.alternative.findMany(),
    prisma.criteria.findMany(),
    prisma.evaluation.findMany(),
  ]);

  const alternatives = naturalSortByCode(rawAlternatives);
  const criteria = naturalSortByCode(rawCriteria);

  // Matrix map for the table: key is `${altId}_${critId}`
  const matrixMap = new Map<string, number>();
  for (const evaluation of allEvaluations) {
    matrixMap.set(`${evaluation.alternativeId}_${evaluation.criteriaId}`, evaluation.value);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Matriks Keputusan (Penilaian Alternatif)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar nilai angka (skala 1-5) hasil normalisasi otomatis dari pengecekan indikator di menu Sub Alternatif.
        </p>
      </header>

      {alternatives.length === 0 || criteria.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Tambahkan data alternatif dan kriteria terlebih dahulu.
          </CardContent>
        </Card>
      ) : (
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
                  <TableRow key={alt.id}>
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
      )}

      {criteria.length > 0 && (
        <Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="bg-muted/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-xl">Atur Bobot Kriteria</CardTitle>
            </div>
            <CardDescription className="ml-10">
              Masukkan bobot kriteria dalam skala angka bebas (misalnya 1-100). Sistem akan otomatis menormalisasinya menjadi persentase.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <WeightsForm criteria={criteria} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
