export default function KriteriaLoading() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted"></div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 animate-pulse rounded-md bg-muted"></div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
        </div>
        
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="h-12 border-b bg-muted/40 animate-pulse"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-16 items-center border-b px-4 space-x-4">
              <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
              <div className="h-4 flex-1 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
