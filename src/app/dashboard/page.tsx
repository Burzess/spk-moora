import Link from "next/link";
import { ListChecks, MapPin, Percent, Trophy } from "lucide-react";

import { calculateAuditMoora } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number) {
    return value.toLocaleString("id-ID", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
}

export default async function DashboardPage() {
    const [criteriaCount, alternativesCount, evaluationsCount, audit] =
        await Promise.all([
            prisma.criteria.count(),
            prisma.alternative.count(),
            prisma.evaluation.count(),
            calculateAuditMoora(),
        ]);

    const expectedEvaluations = criteriaCount * alternativesCount;
    const topRecommendation = audit.result?.ranking[0];

    return (
        <div className="space-y-6">
            <header className="rounded-xl border bg-card px-5 py-4">
                <h1 className="font-heading text-2xl font-semibold">Dashboard Admin</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Ringkasan data master, progres penilaian, dan rekomendasi teratas.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            Total Kriteria
                            <ListChecks className="size-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{criteriaCount}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            Total Alternatif
                            <MapPin className="size-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{alternativesCount}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            Data Penilaian
                            <Percent className="size-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">
                            {evaluationsCount}/{expectedEvaluations}
                        </p>
                    </CardContent>
                </Card>
            </section>

            <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-400/35 dark:bg-amber-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="size-5 text-amber-600 dark:text-amber-300" />
                        Rekomendasi Sementara (Audit Bobot Default)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {topRecommendation ? (
                        <>
                            <p className="text-base font-medium">
                                #{topRecommendation.rank} {topRecommendation.alternativeCode} -{" "}
                                {topRecommendation.alternativeName}
                            </p>
                            <Badge>Yi: {formatNumber(topRecommendation.yi)}</Badge>
                            <p className="text-muted-foreground">{audit.message}</p>
                            <Link href="/dashboard/hasil" className="inline-block text-primary underline-offset-4 hover:underline">
                                Lihat detail perhitungan audit
                            </Link>
                        </>
                    ) : (
                        <p className="text-muted-foreground">
                            {audit.message} Lengkapi data pada halaman kriteria, alternatif, dan
                            penilaian.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
