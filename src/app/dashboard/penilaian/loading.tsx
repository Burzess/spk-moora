export default function PenilaianLoading() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div className="h-8 w-72 animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted"></div>
      </header>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted"></div>
        <div className="flex items-end gap-3">
            <div className="w-64 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
            </div>
            <div className="h-9 w-32 animate-pulse rounded bg-muted"></div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6 mt-6">
        <div className="h-6 w-64 animate-pulse rounded bg-muted"></div>
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-48 animate-pulse rounded bg-muted"></div>
                        <div className="h-5 w-16 animate-pulse rounded-full bg-muted"></div>
                    </div>
                    <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
