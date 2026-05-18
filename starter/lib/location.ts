import type { Location } from "@/lib/types";

export const emptyLocation = (): Location => ({
  site: "",
  room: null,
  row: null,
  rack: null,
  ru: null,
});

export function normalizeAssetTag(value: string): string {
  return value.trim().toUpperCase();
}

export function parseLocationScan(rawValue: string): Location | null {
  const value = rawValue.trim();
  if (!value) return null;

  const parts = value.startsWith("LOC|")
    ? value.split("|").slice(1)
    : value.split("/");

  const cleaned = parts.map((part) => part.trim()).filter(Boolean);
  if (cleaned.length < 2) return null;

  return {
    site: cleaned[0] ?? "",
    room: cleaned[1] ?? null,
    row: cleaned[2] ?? null,
    rack: cleaned[3] ?? null,
    ru: cleaned[4] ?? null,
  };
}

export function locationToScanPayload(location: Location): string {
  return [
    "LOC",
    location.site,
    location.room ?? "",
    location.row ?? "",
    location.rack ?? "",
    location.ru ?? "",
  ].join("|");
}
