export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <header className="rounded-xl border bg-card px-5 py-4 space-y-3">
                <div className="h-8 w-[250px] animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-[400px] animate-pulse rounded-md bg-muted"></div>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                            <div className="size-4 animate-pulse rounded bg-muted"></div>
                        </div>
                        <div className="h-9 w-12 animate-pulse rounded bg-muted"></div>
                    </div>
                ))}
            </section>

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="h-6 w-[350px] animate-pulse rounded bg-muted"></div>
                <div className="space-y-2">
                    <div className="h-4 w-[250px] animate-pulse rounded bg-muted"></div>
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-4 w-[300px] animate-pulse rounded bg-muted"></div>
                </div>
            </div>
        </div>
    );
}
