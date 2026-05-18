export default function ManagerLoading() {
  return (
    <div className="space-y-6" aria-label="Loading asset dashboard">
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-gray-200" />
      </div>
      <section className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </section>
      <div className="rounded-lg border bg-white p-4">
        <div className="h-10 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
