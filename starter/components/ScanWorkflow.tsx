"use client";

import { useCallback, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { toUiError, type UiError } from "@/lib/errors";
import { formatLocation } from "@/lib/format";
import { emptyLocation, normalizeAssetTag, parseLocationScan } from "@/lib/location";
import { postScan } from "@/lib/scan-client";
import type { Asset, Location } from "@/lib/types";
import { LocationInput } from "@/components/LocationInput";
import { ScanInput } from "@/components/ScanInput";
import { StatusBadge } from "@/components/StatusBadge";

type WorkflowKind = "store" | "deploy";

export function ScanWorkflow({ kind }: { kind: WorkflowKind }) {
  const [assetTag, setAssetTag] = useState("");
  const [asset, setAsset] = useState<Asset | null>(null);
  const [location, setLocation] = useState<Location>(emptyLocation);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [success, setSuccess] = useState<Asset | null>(null);
  const isDeploy = kind === "deploy";

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

  const handleLocationScan = useCallback((payload: string) => {
    const parsed = parseLocationScan(payload);
    setSuccess(null);
    if (!parsed) {
      setError({
        title: "Location barcode was not recognized",
        message: "Use a location label like LOC|Site|Room|Row|Rack|RU or Site/Room/Row/Rack/RU.",
      });
      return;
    }
    setLocation(parsed);
    setError(null);
  }, []);

  function missingFields(): string[] {
    const missing: string[] = [];
    if (!assetTag) missing.push("asset tag");
    if (!location.site) missing.push("site");
    if (!location.room) missing.push("room");
    if (isDeploy && !location.rack) missing.push("rack");
    if (isDeploy && !location.ru) missing.push("RU");
    return missing;
  }

  async function submit(): Promise<void> {
    const missing = missingFields();
    if (missing.length > 0) {
      setError({
        title: "Scan is missing information",
        message: `Add ${missing.join(", ")} before posting this ${kind}.`,
      });
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await postScan(kind, {
        asset_tag: assetTag,
        location,
        user_id: getCurrentUserId(),
        scan_payload: `${kind}:${assetTag}:${formatLocation(location)}`,
      });
      setAsset(result);
      setSuccess(result);
    } catch (err) {
      setError(
        toUiError(
          err,
          `The ${kind} scan did not post. Check the current state and location.`,
        ),
      );
      if (err instanceof ApiError && err.details?.from_state && asset) {
        setAsset({ ...asset, state: err.details.from_state as Asset["state"] });
      }
    } finally {
      setBusy(false);
    }
  }

  function reset(): void {
    setAssetTag("");
    setAsset(null);
    setLocation(emptyLocation());
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-white p-4">
        <ScanInput
          label="Asset tag"
          placeholder="Scan asset tag, for example C0000104"
          onScan={handleAssetScan}
          disabled={busy}
        />
        {assetTag ? (
          <p className="mt-2 text-sm text-gray-600">
            Current scan: <span className="font-medium">{assetTag}</span>
          </p>
        ) : null}
      </div>

      {asset ? (
        <section className="rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-950">
                {asset.manufacturer} {asset.model}
              </h2>
              <p className="text-sm text-gray-600">
                {asset.asset_tag} - Serial {asset.serial}
              </p>
            </div>
            <StatusBadge state={asset.state} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Current location</dt>
              <dd className="font-medium text-gray-900">
                {formatLocation(asset.location)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Custodian</dt>
              <dd className="font-medium text-gray-900">{asset.custodian}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <LocationInput
        label={isDeploy ? "Destination rack" : "Storage location"}
        value={location}
        onChange={setLocation}
        disabled={busy}
        requireRack={isDeploy}
        requireRu={isDeploy}
      />

      <div className="rounded-lg border bg-white p-4">
        <ScanInput
          label={isDeploy ? "Location barcode" : "Storage location barcode"}
          placeholder="Scan LOC|Site|Room|Row|Rack|RU label"
          onScan={handleLocationScan}
          disabled={busy}
          autoFocus={false}
        />
        <p className="mt-2 text-sm text-gray-600">
          Scanning a location fills the fields above; manual edits stay available for damaged labels.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-950">{error.title}</p>
          <p className="mt-1 text-sm text-red-800">{error.message}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-950">
            {isDeploy ? "Asset deployed" : "Asset stored"}
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            {success.asset_tag} is now {formatLocation(success.location)}.
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
          {busy
            ? "Posting scan..."
            : isDeploy
              ? "Post deploy scan"
              : "Post store scan"}
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
