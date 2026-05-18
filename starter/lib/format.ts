import type { Asset, AssetState, EventType, Location } from "@/lib/types";

export const ASSET_STATES: AssetState[] = [
  "received",
  "stored",
  "in_service",
  "rma_pending",
  "disposed",
  "unreceived",
];

export function humanize(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLocation(location: Location | null | undefined): string {
  if (!location) return "No location recorded";
  return [
    location.site,
    location.room,
    location.row,
    location.rack,
    location.ru,
  ]
    .filter(Boolean)
    .join(" / ");
}

export function toRackLocation(location: Location): string {
  return [
    location.site,
    location.room,
    location.row,
    location.rack,
    location.ru,
  ]
    .filter(Boolean)
    .join("/");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function stateTone(state: AssetState): string {
  switch (state) {
    case "in_service":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "stored":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "received":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "rma_pending":
      return "bg-violet-50 text-violet-800 ring-violet-200";
    case "disposed":
      return "bg-slate-100 text-slate-700 ring-slate-300";
    case "unreceived":
      return "bg-rose-50 text-rose-800 ring-rose-200";
  }
}

export function eventLabel(eventType: EventType): string {
  switch (eventType) {
    case "duplicate_receive":
      return "Duplicate receive";
    case "transfer_custody":
      return "Transfer custody";
    case "rma_open":
      return "RMA opened";
    case "rma_receive_back":
      return "RMA returned";
    default:
      return humanize(eventType);
  }
}

export function assetSearchText(asset: Asset): string {
  return [
    asset.asset_tag,
    asset.serial,
    asset.model,
    asset.manufacturer,
    asset.asset_class,
    asset.state,
    asset.custodian,
    formatLocation(asset.location),
  ]
    .join(" ")
    .toLowerCase();
}
