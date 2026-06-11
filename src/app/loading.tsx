export default function RootLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col p-8 space-y-6">
      <div className="h-12 w-48 animate-pulse rounded-md bg-muted"></div>
      <div className="space-y-4">
        <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-[90%] animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-[95%] animate-pulse rounded-md bg-muted"></div>
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted mt-8"></div>
      </div>
    </div>
  );
}
