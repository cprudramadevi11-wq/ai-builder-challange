import Link from "next/link";
import { buildReconcileReport, type ReconcileCategory, type ReconcileItem, type ReconcileSeverity } from "@/lib/reconcile";
import { formatCurrency, formatDateTime, formatLocation, humanize } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const severityStyles: Record<
  ReconcileSeverity,
  { label: string; badge: string; border: string; text: string }
> = {
  critical: {
    label: "Investigate now",
    badge: "bg-red-50 text-red-800 ring-red-200",
    border: "border-red-200",
    text: "text-red-950",
  },
  action: {
    label: "Action needed",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    border: "border-amber-200",
    text: "text-amber-950",
  },
  watch: {
    label: "Review",
    badge: "bg-blue-50 text-blue-800 ring-blue-200",
    border: "border-blue-200",
    text: "text-blue-950",
  },
  expected: {
    label: "Expected",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    border: "border-emerald-200",
    text: "text-emerald-950",
  },
};

function SeverityBadge({ severity }: { severity: ReconcileSeverity }) {
  const style = severityStyles[severity];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badge}`}>
      {style.label}
    </span>
  );
}

function Evidence({ item }: { item: ReconcileItem }) {
  return (
    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
      <div>
        <dt className="text-gray-500">Operations</dt>
        <dd className="mt-1 font-medium text-gray-900">
          {item.ops ? (
            <>
              <StatusBadge state={item.ops.state} />{" "}
              <span className="block pt-2">{formatLocation(item.ops.location)}</span>
              <span className="block text-gray-600">Custodian {item.ops.custodian}</span>
            </>
          ) : (
            "No operations asset"
          )}
        </dd>
      </div>
      <div>
        <dt className="text-gray-500">Facilities</dt>
        <dd className="mt-1 font-medium text-gray-900">
          {item.facilities ? (
            <>
              <span>{item.facilities.rack_location}</span>
              <span className="block text-gray-600">
                Seen {formatDateTime(item.facilities.last_observed)}
              </span>
            </>
          ) : (
            "No rack row"
          )}
        </dd>
      </div>
      <div>
        <dt className="text-gray-500">Finance</dt>
        <dd className="mt-1 font-medium text-gray-900">
          {item.finance ? (
            <>
              <span>{humanize(item.finance.status)}</span>
              <span className="block text-gray-600">
                {item.finance.site || "No site"} - {formatCurrency(item.finance.book_value_usd)}
              </span>
            </>
          ) : (
            "No equipment row"
          )}
        </dd>
      </div>
    </dl>
  );
}

function CategorySection({ category }: { category: ReconcileCategory }) {
  const style = severityStyles[category.severity];
  const topItems = category.items.slice(0, category.severity === "expected" ? 6 : 20);
  const hiddenCount = category.items.length - topItems.length;

  return (
    <section className={`overflow-hidden rounded-lg border bg-white ${style.border}`}>
      <div className="border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={`text-lg font-semibold ${style.text}`}>{category.label}</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">{category.managerMeaning}</p>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={category.severity} />
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {category.items.length}
            </span>
          </div>
        </div>
      </div>

      {category.items.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-600">Nothing in this category right now.</div>
      ) : (
        <ol className="divide-y divide-gray-100">
          {topItems.map((item) => (
            <li key={`${category.id}-${item.tag}-${item.title}`} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/manager/assets/${item.tag}`} className="font-semibold text-blue-700 hover:underline">
                    {item.tag}
                  </Link>
                  <p className="mt-1 font-medium text-gray-950">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.explanation}</p>
                </div>
                <SeverityBadge severity={item.severity} />
              </div>
              <Evidence item={item} />
            </li>
          ))}
        </ol>
      )}

      {hiddenCount > 0 ? (
        <div className="border-t bg-gray-50 px-5 py-3 text-sm text-gray-600">
          Showing the first {topItems.length} rows. Narrow the investigation by opening affected assets from the dashboard.
        </div>
      ) : null}
    </section>
  );
}

export default async function ManagerReconcilePage() {
  try {
    const report = await buildReconcileReport();
    const actionCategories = report.categories.filter((category) => category.severity !== "expected");
    const expectedCategory = report.categories.find((category) => category.severity === "expected");

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/manager" className="text-sm text-blue-700 hover:underline">
              Back to assets
            </Link>
            <h1 className="mt-3 text-2xl font-bold">Reconciliation report</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              A Monday-morning view of differences between operations, facilities, and finance. The top sections are the rows most likely to need a person today.
            </p>
          </div>
          <time className="text-sm text-gray-500">
            Generated {formatDateTime(report.generated_at)}
          </time>
        </div>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Operations assets</p>
            <p className="mt-1 text-2xl font-semibold">{report.totals.operations}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Facilities rows</p>
            <p className="mt-1 text-2xl font-semibold">{report.totals.facilities}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Finance rows</p>
            <p className="mt-1 text-2xl font-semibold">{report.totals.finance}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Needs review</p>
            <p className="mt-1 text-2xl font-semibold">{report.totals.flagged}</p>
          </div>
        </section>

        {report.totals.flagged === 0 ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="font-semibold text-emerald-950">No action items found</h2>
            <p className="mt-1 text-sm text-emerald-800">
              The systems still differ where their scope differs, but no rack or finance mismatch needs attention.
            </p>
          </section>
        ) : null}

        <div className="space-y-5">
          {actionCategories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
          {expectedCategory ? <CategorySection category={expectedCategory} /> : null}
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-950">Reconciliation could not load</h1>
        <p className="mt-2 text-sm text-red-800">
          Check that the API is running and that the starter app has server-side API credentials.
        </p>
        <p className="mt-3 text-xs text-red-700">
          {err instanceof Error ? err.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
