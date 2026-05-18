import Link from "next/link";

const workflows = [
  {
    href: "/tech/receive",
    label: "Receive",
    body: "Start with the asset tag, then confirm serial, model, class, and dock location.",
  },
  {
    href: "/tech/store",
    label: "Store",
    body: "Scan an asset and a storage label. Racked assets are removed from facilities.",
  },
  {
    href: "/tech/deploy",
    label: "Deploy",
    body: "Scan an asset and a complete rack label with site, room, rack, and RU.",
  },
  {
    href: "/tech/transfer",
    label: "Transfer",
    body: "Scan the asset, then the receiving badge. Custody changes; state stays put.",
  },
];

export default function TechLandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technician workflows</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Choose the physical action in front of you. Each workflow keeps focus on the next scan and leaves manual fields available when a label is damaged.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {workflows.map((workflow) => (
          <Link
            key={workflow.href}
            href={workflow.href}
            className="min-h-[132px] rounded-lg border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <h2 className="text-lg font-semibold text-gray-950">{workflow.label}</h2>
            <p className="mt-2 text-sm text-gray-600">{workflow.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
