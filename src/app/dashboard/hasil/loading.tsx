export default function HasilLoading() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted"></div>
      </header>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
        <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
            ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 pb-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="h-10 border-y bg-muted/40 animate-pulse"></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-b bg-muted/20 animate-pulse"></div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 pb-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="h-10 border-y bg-muted/40 animate-pulse"></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-b bg-muted/20 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
