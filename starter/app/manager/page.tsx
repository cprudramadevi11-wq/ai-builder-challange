import Link from "next/link";
import { AssetListClient } from "@/components/AssetListClient";
import { api } from "@/lib/api-client";
import { humanize } from "@/lib/format";
import type { Asset, AssetState } from "@/lib/types";

const priorityStates: AssetState[] = ["in_service", "stored", "received", "disposed"];

function countByState(assets: Asset[], state: AssetState): number {
  return assets.filter((asset) => asset.state === state).length;
}

export default async function ManagerLandingPage() {
  try {
    const assets = await api.assets.list();
    const sites = new Set(assets.map((asset) => asset.location.site));
    const recentlyUpdated = [...assets].sort(
      (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at),
    )[0];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Asset dashboard</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Triage the fleet by state, site, custodian, and recent movement.
            </p>
          </div>
          <Link
            href="/manager/reconcile"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Reconciliation report
          </Link>
        </div>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Tracked assets</p>
            <p className="mt-1 text-2xl font-semibold">{assets.length}</p>
            <p className="mt-1 text-xs text-gray-500">{sites.size} active sites</p>
          </div>
          {priorityStates.map((state) => (
            <div key={state} className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-500">{humanize(state)}</p>
              <p className="mt-1 text-2xl font-semibold">
                {countByState(assets, state)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {state === "in_service"
                  ? "Should be visible to facilities"
                  : state === "stored"
                    ? "Outside rack tracking"
                    : state === "received"
                      ? "Waiting on next move"
                      : "Should be retired in finance"}
              </p>
            </div>
          ))}
        </section>

        {recentlyUpdated ? (
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-950">
              Latest movement:{" "}
              <Link
                href={`/manager/assets/${recentlyUpdated.asset_tag}`}
                className="text-blue-800 underline"
              >
                {recentlyUpdated.asset_tag}
              </Link>
            </p>
            <p className="mt-1 text-sm text-blue-800">
              {recentlyUpdated.manufacturer} {recentlyUpdated.model} is currently{" "}
              {humanize(recentlyUpdated.state)}.
            </p>
          </section>
        ) : null}

        <AssetListClient assets={assets} />
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-950">
          Asset dashboard could not load
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Check that the API is running and that `API_TOKEN` is set for the
          starter app.
        </p>
        <p className="mt-3 text-xs text-red-700">
          {err instanceof Error ? err.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
