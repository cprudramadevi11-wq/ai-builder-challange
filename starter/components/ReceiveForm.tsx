"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { toUiError, type UiError } from "@/lib/errors";
import { formatLocation, humanize } from "@/lib/format";
import { emptyLocation, normalizeAssetTag } from "@/lib/location";
import { postScan } from "@/lib/scan-client";
import type { Asset, AssetClass, Location, ReceiveScanInput } from "@/lib/types";
import { LocationInput } from "@/components/LocationInput";
import { ScanInput } from "@/components/ScanInput";
import { StatusBadge } from "@/components/StatusBadge";

type ReceiveStatus =
  | "idle"
  | "looking_up"
  | "ready"
  | "submitting"
  | "success"
  | "error";

type ReceiveResultKind = "created" | "duplicate";

const ASSET_TAG_PATTERN = /^C\d{7}$/;
const ASSET_CLASSES: AssetClass[] = [
  "instrument",
  "compute",
  "network",
  "power",
  "consumable_durable",
];

function validateReceive(input: {
  assetTag: string;
  serial: string;
  model: string;
  manufacturer: string;
  location: Location;
}): UiError | null {
  if (!input.assetTag) {
    return {
      title: "Asset tag required",
      message: "Scan the barcode or type the tag before confirming receipt.",
    };
  }
  if (!ASSET_TAG_PATTERN.test(input.assetTag)) {
    return {
      title: "Asset tag is not valid",
      message: "Asset tags use C followed by seven digits, like C0009001.",
    };
  }
  if (!input.serial.trim()) {
    return {
      title: "Serial required",
      message: "Enter the manufacturer serial before creating the asset.",
    };
  }
  if (!input.model.trim()) {
    return {
      title: "Model required",
      message: "Enter the model so managers can identify this asset later.",
    };
  }
  if (!input.manufacturer.trim()) {
    return {
      title: "Manufacturer required",
      message: "Enter the manufacturer before confirming receipt.",
    };
  }
  if (!input.location.site || !input.location.room) {
    return {
      title: "Receipt location incomplete",
      message: "Receiving needs at least a site and room.",
    };
  }
  return null;
}

function receiveApiError(err: unknown): UiError {
  if (err instanceof ApiError && err.code === "and_match_failed") {
    return {
      title: "Tag belongs to another serial",
      message: `This tag is already paired with ${String(
        err.details?.expected_serial ?? "a different serial",
      )}. You entered ${String(err.details?.provided_serial ?? "a new serial")}.`,
    };
  }
  return toUiError(err, "The receive scan did not post. Check the API and try again.");
}

export function ReceiveForm() {
  const [status, setStatus] = useState<ReceiveStatus>("idle");
  const [assetTag, setAssetTag] = useState("");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass>("instrument");
  const [location, setLocation] = useState<Location>(emptyLocation);
  const [existingAsset, setExistingAsset] = useState<Asset | null>(null);
  const [receivedAsset, setReceivedAsset] = useState<Asset | null>(null);
  const [resultKind, setResultKind] = useState<ReceiveResultKind | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const busy = status === "looking_up" || status === "submitting";
  const canSubmit = status !== "submitting";

  const statusText = useMemo(() => {
    if (status === "looking_up") return "Checking tag...";
    if (status === "submitting") return "Posting receipt...";
    if (existingAsset) return "Existing asset found";
    if (assetTag) return "Ready for asset details";
    return "Waiting for asset tag";
  }, [assetTag, existingAsset, status]);

  const handleTagScanned = useCallback(async (rawTag: string) => {
    const tag = normalizeAssetTag(rawTag);
    setAssetTag(tag);
    setExistingAsset(null);
    setReceivedAsset(null);
    setResultKind(null);
    setError(null);

    if (!ASSET_TAG_PATTERN.test(tag)) {
      setStatus("error");
      setError({
        title: "Asset tag is not valid",
        message: "Asset tags use C followed by seven digits, like C0009001.",
      });
      return;
    }

    setStatus("looking_up");
    try {
      const asset = await api.assets.get(tag);
      setExistingAsset(asset);
      setSerial(asset.serial);
      setModel(asset.model);
      setManufacturer(asset.manufacturer);
      setAssetClass(asset.asset_class);
      setLocation(asset.location);
      setStatus("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setStatus("ready");
        return;
      }
      setStatus("error");
      setError(
        toUiError(
          err,
          "Could not check whether this tag already exists. Confirm the network and try again.",
        ),
      );
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setReceivedAsset(null);
    setResultKind(null);

    const normalizedTag = assetTag.trim().toUpperCase();
    const validation = validateReceive({
      assetTag: normalizedTag,
      serial,
      model,
      manufacturer,
      location,
    });
    if (validation) {
      setStatus("error");
      setError(validation);
      return;
    }

    const input: ReceiveScanInput = {
      asset_tag: normalizedTag,
      serial: serial.trim(),
      model: model.trim(),
      manufacturer: manufacturer.trim(),
      asset_class: assetClass,
      location,
      user_id: getCurrentUserId(),
      scan_payload: `receive:${normalizedTag}:${serial.trim()}`,
    };

    setStatus("submitting");
    try {
      const result = await postScan("receive", input);
      setAssetTag(result.asset_tag);
      setExistingAsset(result);
      setReceivedAsset(result);
      setResultKind(existingAsset ? "duplicate" : "created");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(receiveApiError(err));
    }
  }

  function clearForNextAsset(): void {
    setStatus("idle");
    setAssetTag("");
    setSerial("");
    setModel("");
    setManufacturer("");
    setAssetClass("instrument");
    setLocation(emptyLocation());
    setExistingAsset(null);
    setReceivedAsset(null);
    setResultKind(null);
    setError(null);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-white p-4">
        <ScanInput
          label="Asset tag"
          placeholder="Scan or type tag, for example C0009001"
          onScan={handleTagScanned}
          disabled={busy}
          autoFocus
        />
        <p className="mt-2 text-sm text-gray-600" aria-live="polite">
          {statusText}
          {assetTag ? (
            <>
              {" "}
              <span className="font-medium text-gray-900">{assetTag}</span>
            </>
          ) : null}
        </p>
      </section>

      {existingAsset && status !== "success" ? (
        <section className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-blue-950">Tag already exists</p>
              <p className="mt-1 text-sm text-blue-800">
                Confirming with the same serial records a duplicate receive
                event instead of creating another asset.
              </p>
            </div>
            <StatusBadge state={existingAsset.state} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-blue-700">Serial on file</dt>
              <dd className="font-medium text-blue-950">{existingAsset.serial}</dd>
            </div>
            <div>
              <dt className="text-blue-700">Current location</dt>
              <dd className="font-medium text-blue-950">
                {formatLocation(existingAsset.location)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {error ? (
        <div
          className="rounded-lg border-2 border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="font-semibold text-red-950">{error.title}</p>
          <p className="mt-1 text-sm text-red-800">{error.message}</p>
        </div>
      ) : null}

      {receivedAsset ? (
        <div
          className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4"
          aria-live="polite"
        >
          <p className="font-semibold text-emerald-950">
            {resultKind === "duplicate"
              ? "Duplicate receive recorded"
              : "Asset received"}
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            {receivedAsset.asset_tag} is {humanize(receivedAsset.state)} at{" "}
            {formatLocation(receivedAsset.location)}.
          </p>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Serial <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={serial}
              onChange={(event) => setSerial(event.target.value)}
              placeholder="SN-DEMO-1"
              disabled={busy}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Asset class <span className="text-red-600">*</span>
            </span>
            <select
              value={assetClass}
              onChange={(event) => setAssetClass(event.target.value as AssetClass)}
              disabled={busy}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            >
              {ASSET_CLASSES.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Manufacturer <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={manufacturer}
              onChange={(event) => setManufacturer(event.target.value)}
              placeholder="BioSystems Inc"
              disabled={busy}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Model <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Genomics Sequencer 2000"
              disabled={busy}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </label>
        </div>

        <LocationInput
          label="Receipt location"
          value={location}
          onChange={setLocation}
          disabled={busy}
        />

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-[48px] rounded-lg bg-blue-700 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-800 disabled:bg-gray-400"
          >
            {status === "submitting" ? "Posting receipt..." : "Confirm receipt"}
          </button>
          <button
            type="button"
            onClick={clearForNextAsset}
            className="min-h-[48px] rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            Next asset
          </button>
        </div>
      </form>
    </div>
  );
}
