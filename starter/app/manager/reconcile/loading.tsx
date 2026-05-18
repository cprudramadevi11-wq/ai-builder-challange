export default function ReconcileLoading() {
  return (
    <div className="space-y-6" aria-label="Loading reconciliation report">
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-gray-200" />
      </div>
      <section className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-14 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </section>
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={index} className="rounded-lg border bg-white p-5">
          <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full max-w-3xl animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-20 animate-pulse rounded bg-gray-100" />
            <div className="h-20 animate-pulse rounded bg-gray-100" />
          </div>
        </section>
      ))}
    </div>
  );
}
