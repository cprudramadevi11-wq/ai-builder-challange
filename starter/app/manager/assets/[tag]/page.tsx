import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";
import {
  eventLabel,
  formatDateTime,
  formatLocation,
  humanize,
} from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export default async function ManagerAssetDetailPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<React.ReactElement> {
  const { tag } = await params;

  try {
    const [asset, events] = await Promise.all([
      api.assets.get(tag),
      api.assets.history(tag),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <Link href="/manager" className="text-sm text-blue-700 hover:underline">
            Back to assets
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{asset.asset_tag}</h1>
              <p className="mt-1 text-gray-600">
                {asset.manufacturer} {asset.model} - Serial {asset.serial}
              </p>
            </div>
            <StatusBadge state={asset.state} />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">State</p>
            <p className="mt-1 font-semibold">{humanize(asset.state)}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Custodian</p>
            <p className="mt-1 font-semibold">{asset.custodian}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 md:col-span-2">
            <p className="text-sm text-gray-500">Current location</p>
            <p className="mt-1 font-semibold">{formatLocation(asset.location)}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Asset details</h2>
          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-gray-500">Class</dt>
              <dd className="font-medium">{humanize(asset.asset_class)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium">{formatDateTime(asset.created_at)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Updated</dt>
              <dd className="font-medium">{formatDateTime(asset.updated_at)}</dd>
            </div>
            {asset.procurement_note ? (
              <div className="md:col-span-3">
                <dt className="text-gray-500">Procurement note</dt>
                <dd className="font-medium">{asset.procurement_note}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-lg border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold">Event history</h2>
            <p className="mt-1 text-sm text-gray-600">
              Newest first, exactly as recorded by scan events.
            </p>
          </div>
          {events.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">
              No scan events have been recorded for this asset yet.
            </div>
          ) : (
            <ol className="divide-y divide-gray-100">
              {events.map((event) => (
                <li key={event.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{eventLabel(event.event_type)}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {event.from_state
                          ? `${humanize(event.from_state)} to ${humanize(event.to_state)}`
                          : humanize(event.to_state)}
                      </p>
                    </div>
                    <time className="text-sm text-gray-500">
                      {formatDateTime(event.timestamp)}
                    </time>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <dt className="text-gray-500">User</dt>
                      <dd className="font-medium">{event.user_id}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">From</dt>
                      <dd className="font-medium">
                        {formatLocation(event.from_location)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">To</dt>
                      <dd className="font-medium">
                        {formatLocation(event.to_location)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-950">
          Asset detail could not load
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Check the API connection and try this asset again.
        </p>
      </div>
    );
  }
}
