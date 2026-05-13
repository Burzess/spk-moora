import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { ensureDefaultAdmin, getAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session.isLoggedIn && session.adminId) {
    redirect("/dashboard");
  }

  await ensureDefaultAdmin();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-lg space-y-4 text-center lg:text-left">
          <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:border dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:backdrop-blur-sm">
            Admin Area
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-100">
            Kelola data SPK MOORA secara terpusat.
          </h1>
          <p className="text-slate-600 dark:text-zinc-300">
            Setelah login, Anda dapat mengelola kriteria, sub-kriteria, alternatif
            lokasi, penilaian, serta melihat hasil audit MOORA untuk seluruh data.
          </p>
          <Link href="/" className="text-sm text-slate-700 underline-offset-4 transition-colors hover:text-slate-900 hover:underline dark:text-zinc-200 dark:hover:text-zinc-100">
            Kembali ke halaman publik
          </Link>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
