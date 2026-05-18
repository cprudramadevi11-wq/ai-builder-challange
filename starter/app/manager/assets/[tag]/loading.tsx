export default function AssetDetailLoading() {
  return (
    <div className="space-y-6" aria-label="Loading asset detail">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-200" />
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </section>
      <section className="rounded-lg border bg-white p-5">
        <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </section>
    </div>
  );
}
