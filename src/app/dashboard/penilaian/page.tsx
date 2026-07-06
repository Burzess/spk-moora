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

export default async function PenilaianPage() {
  const [alternatives, criteria, allEvaluations] = await Promise.all([
    prisma.alternative.findMany({ orderBy: { code: "asc" } }),
    prisma.criteria.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.evaluation.findMany(),
  ]);

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
    </div>
  );
}
