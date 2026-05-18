import Link from "next/link";

const primaryLinks = [
  {
    href: "/tech/receive",
    title: "Receive",
    description: "Create or confirm incoming assets at the dock.",
  },
  {
    href: "/tech/store",
    title: "Store",
    description: "Move received or racked assets into storage.",
  },
  {
    href: "/tech/deploy",
    title: "Deploy",
    description: "Rack an asset and synchronize facilities and finance.",
  },
  {
    href: "/tech/transfer",
    title: "Transfer",
    description: "Hand custody to another user without changing state.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            Lab asset operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Asset control center</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Fast scan workflows for technicians and a focused review surface for managers keeping operations, facilities, and finance aligned.
          </p>
        </div>
        <Link
          href="/dev/barcodes"
          className="min-h-[44px] rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Printable labels
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <h2 className="font-semibold text-gray-950">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/manager"
          className="rounded-lg border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="text-xl font-semibold">Manager dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Search, filter, sort, and inspect event history for the fleet before standup.
          </p>
        </Link>
        <Link
          href="/manager/reconcile"
          className="rounded-lg border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="text-xl font-semibold">Reconciliation</h2>
          <p className="mt-2 text-sm text-gray-600">
            See which system differences need action and which are expected scope gaps.
          </p>
        </Link>
      </section>
    </div>
  );
}
