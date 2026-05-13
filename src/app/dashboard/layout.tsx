import { Sidebar } from "@/components/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-900">
      <Sidebar username={admin.username} />
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
