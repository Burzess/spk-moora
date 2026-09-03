import { AlternatifTable } from "@/app/dashboard/alternatif/alternatif-table";
import { prisma } from "@/lib/prisma";
import { naturalSortByCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlternatifPage() {
  const alternativesFromDb = await prisma.alternative.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  const alternatives = naturalSortByCode(alternativesFromDb);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4">
        <h1 className="font-heading text-2xl font-semibold">Kelola Alternatif Lokasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambah, ubah, dan hapus lokasi yang akan dibandingkan.
        </p>
      </header>

      <AlternatifTable alternatives={alternatives} />
    </div>
  );
}
