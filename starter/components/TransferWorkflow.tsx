"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { toUiError, type UiError } from "@/lib/errors";
import { formatLocation } from "@/lib/format";
import { normalizeAssetTag } from "@/lib/location";
import { postScan } from "@/lib/scan-client";
import type { Asset } from "@/lib/types";
import { ScanInput } from "@/components/ScanInput";
import { StatusBadge } from "@/components/StatusBadge";

export function TransferWorkflow() {
  const [assetTag, setAssetTag] = useState("");
  const [toCustodian, setToCustodian] = useState("");
  const [asset, setAsset] = useState<Asset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [success, setSuccess] = useState<Asset | null>(null);

  const handleAssetScan = useCallback(async (rawTag: string) => {
    const tag = normalizeAssetTag(rawTag);
    setAssetTag(tag);
    setSuccess(null);
    setError(null);
    setBusy(true);
    try {
      setAsset(await api.assets.get(tag));
    } catch (err) {
      setAsset(null);
      setError(toUiError(err, "This tag could not be loaded."));
    } finally {
      setBusy(false);
    }
  }, []);

  const handleBadgeScan = useCallback((badge: string) => {
    setToCustodian(badge);
    setError(null);
  }, []);

  async function submit(): Promise<void> {
    if (!assetTag || !toCustodian) {
      setError({
        title: "Both scans are required",
        message: "Scan the asset tag, then scan the receiving badge.",
      });
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await postScan("transfer", {
        asset_tag: assetTag,
        to_custodian: toCustodian,
        user_id: getCurrentUserId(),
        scan_payload: `transfer:${assetTag}:${toCustodian}`,
      });
      setAsset(result);
      setSuccess(result);
    } catch (err) {
      setError(
        toUiError(
          err,
          "The handoff did not post. Check that the badge belongs to a different custodian.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  function reset(): void {
    setAssetTag("");
    setToCustodian("");
    setAsset(null);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <ScanInput
            label="Asset tag"
            placeholder="Scan asset tag"
            onScan={handleAssetScan}
            disabled={busy}
          />
          {assetTag ? (
            <p className="mt-2 text-sm text-gray-600">
              Asset: <span className="font-medium">{assetTag}</span>
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <ScanInput
            label="Receiving badge"
            placeholder="Scan badge, for example tech-mike"
            onScan={handleBadgeScan}
            disabled={busy}
            autoFocus={false}
          />
          {toCustodian ? (
            <p className="mt-2 text-sm text-gray-600">
              To: <span className="font-medium">{toCustodian}</span>
            </p>
          ) : null}
        </div>
      </div>

      {asset ? (
        <section className="rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-950">
                {asset.manufacturer} {asset.model}
              </h2>
              <p className="text-sm text-gray-600">
                {asset.asset_tag} - {formatLocation(asset.location)}
              </p>
            </div>
            <StatusBadge state={asset.state} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Current custodian</dt>
              <dd className="font-medium text-gray-900">{asset.custodian}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Logged-in sender</dt>
              <dd className="font-medium text-gray-900">{getCurrentUserId()}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-950">{error.title}</p>
          <p className="mt-1 text-sm text-red-800">{error.message}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-950">Custody transferred</p>
          <p className="mt-1 text-sm text-emerald-800">
            {success.asset_tag} is now assigned to {success.custodian}.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="min-h-[48px] rounded-lg bg-blue-700 px-5 py-3 text-base font-semibold text-white hover:bg-blue-800 disabled:bg-gray-400"
        >
          {busy ? "Posting handoff..." : "Post custody transfer"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-[48px] rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-800 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
