import { CriteriaTable } from "@/app/dashboard/kriteria/criteria-table";
import { prisma } from "@/lib/prisma";

export default async function KriteriaPage() {
  const criteria = await prisma.criteria.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      subCriteria: {
        orderBy: [{ value: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          value: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Kelola Kriteria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur kode, nama, serta status benefit/cost untuk tiap kriteria.
        </p>
      </header>

      <CriteriaTable criteria={criteria} />
    </div>
  );
}
