"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { assetSearchText, formatLocation, formatDateTime, ASSET_STATES } from "@/lib/format";
import type { Asset, AssetState } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

type SortKey = "updated_at" | "asset_tag" | "state" | "site";

const PAGE_SIZE = 25;

export function AssetListClient({ assets }: { assets: Asset[] }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<AssetState | "all">("all");
  const [site, setSite] = useState("all");
  const [custodian, setCustodian] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [page, setPage] = useState(1);

  const sites = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.location.site))).sort(),
    [assets],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assets
      .filter((asset) => state === "all" || asset.state === state)
      .filter((asset) => site === "all" || asset.location.site === site)
      .filter((asset) =>
        custodian ? asset.custodian.toLowerCase().includes(custodian.toLowerCase()) : true,
      )
      .filter((asset) => (needle ? assetSearchText(asset).includes(needle) : true))
      .sort((a, b) => {
        if (sortKey === "updated_at") {
          return Date.parse(b.updated_at) - Date.parse(a.updated_at);
        }
        if (sortKey === "site") {
          return a.location.site.localeCompare(b.location.site);
        }
        return String(a[sortKey]).localeCompare(String(b[sortKey]));
      });
  }, [assets, custodian, query, site, sortKey, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter(fn: () => void): void {
    fn();
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Search</span>
            <input
              value={query}
              onChange={(event) => updateFilter(() => setQuery(event.target.value))}
              placeholder="Tag, serial, model, custodian"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">State</span>
            <select
              value={state}
              onChange={(event) =>
                updateFilter(() => setState(event.target.value as AssetState | "all"))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All states</option>
              {ASSET_STATES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Site</span>
            <select
              value={site}
              onChange={(event) => updateFilter(() => setSite(event.target.value))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All sites</option>
              {sites.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="updated_at">Recently updated</option>
              <option value="asset_tag">Asset tag</option>
              <option value="state">State</option>
              <option value="site">Site</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block max-w-sm">
          <span className="text-sm font-medium text-gray-700">Custodian</span>
          <input
            value={custodian}
            onChange={(event) => updateFilter(() => setCustodian(event.target.value))}
            placeholder="tech-jane"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm text-gray-600">
          Showing {pageRows.length} of {filtered.length} matching assets
        </div>
        {pageRows.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-gray-950">No matching assets</h2>
            <p className="mt-1 text-sm text-gray-600">
              Clear a filter or search for a broader tag, model, or custodian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Custodian</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((asset) => (
                  <tr key={asset.asset_tag} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/manager/assets/${asset.asset_tag}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {asset.asset_tag}
                      </Link>
                      <p className="text-gray-600">
                        {asset.manufacturer} {asset.model}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge state={asset.state} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-700">
                      {formatLocation(asset.location)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{asset.custodian}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(asset.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
