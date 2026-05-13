import Link from "next/link";
import { Calculator, LogIn, Map } from "lucide-react";

import { PublicCalculator } from "@/app/public-calculator";
import { prisma } from "@/lib/prisma";

const DEFAULT_PUBLIC_WEIGHTS = [0.25, 0.15, 0.25, 0.1, 0.25];

export default async function HomePage() {
  const [criteria, alternatives] = await Promise.all([
    prisma.criteria.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
      },
    }),
    prisma.alternative.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);

  const initialWeights =
    criteria.length === DEFAULT_PUBLIC_WEIGHTS.length
      ? [...DEFAULT_PUBLIC_WEIGHTS]
      : Array.from({ length: criteria.length }, () =>
          criteria.length > 0 ? 1 / criteria.length : 0
        );

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-lg md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Map className="h-5 w-5" />
                </div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/30">
                  <Calculator className="h-3.5 w-3.5" />
                  SPK Publik
                </p>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 md:text-4xl lg:text-5xl">
                Sistem Pendukung Keputusan <br className="hidden md:block" /> 
                <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-400">
                  Lokasi dengan MOORA
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-300 md:text-base">
                Pilih alternatif lokasi yang ingin dibandingkan, tentukan bobot tiap
                kriteria sesuai kebutuhan Anda, lalu dapatkan rekomendasi dan peringkat
                MOORA secara instan.
              </p>
            </div>
{/*             
            <div className="shrink-0 pt-2">
              <Button asChild variant="outline" className="gap-2 bg-white/80 shadow-sm transition-all hover:bg-white hover:shadow dark:border-white/20 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15">
                <Link href="/login">
                  <LogIn className="h-4 w-4 text-slate-500 dark:text-zinc-300" />
                  <span>Login Admin</span>
                </Link>
              </Button>
            </div> */}
          </div>
        </header>

        {criteria.length === 0 || alternatives.length < 2 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-amber-100 p-1 dark:bg-amber-500/20">
                <Map className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Data belum siap untuk simulasi publik.</p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-100/90">
                  Pastikan admin sudah menambahkan minimal 2 alternatif dan data kriteria
                  melalui dashboard agar perhitungan MOORA dapat dilakukan.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <PublicCalculator
            criteria={criteria}
            alternatives={alternatives}
            initialWeights={initialWeights}
          />
        )}
      </div>
    </div>
  );
}
