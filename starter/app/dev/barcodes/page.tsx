import Link from "next/link";
import { Code128Barcode } from "@/components/Code128Barcode";
import { locationToScanPayload } from "@/lib/location";
import type { Location } from "@/lib/types";

type BarcodeSample = {
  label: string;
  value: string;
  note: string;
};

const locations: Array<{ label: string; location: Location; note: string }> = [
  {
    label: "Receiving dock",
    location: {
      site: "Lab-Building-A",
      room: "Receiving",
      row: null,
      rack: "DOCK-1",
      ru: null,
    },
    note: "Use for receive or storage tests.",
  },
  {
    label: "Storage shelf",
    location: {
      site: "Lab-Building-A",
      room: "Storage-1",
      row: null,
      rack: "SHELF-9",
      ru: null,
    },
    note: "Valid store destination.",
  },
  {
    label: "Deployment rack",
    location: {
      site: "Lab-Building-A",
      room: "Bay-1",
      row: "Aisle-1",
      rack: "A-01",
      ru: "U10",
    },
    note: "Complete deploy destination.",
  },
];

const samples: BarcodeSample[] = [
  {
    label: "Happy path demo asset",
    value: "C0009001",
    note: "Fresh tag for receive smoke tests after reset.",
  },
  {
    label: "In-service seeded asset",
    value: "C0000101",
    note: "Useful for store, deploy, transfer, and detail-page checks.",
  },
  {
    label: "Received seeded asset",
    value: "C0000107",
    note: "Can deploy directly and should write back to facilities and finance.",
  },
  {
    label: "Disposed seeded asset",
    value: "C0000109",
    note: "Should fail store/deploy/transfer with a clear transition error.",
  },
  {
    label: "Receiving badge",
    value: "tech-mike",
    note: "Use as the second scan in custody transfer.",
  },
  ...locations.map((item) => ({
    label: item.label,
    value: locationToScanPayload(item.location),
    note: item.note,
  })),
];

export default function DevBarcodesPage() {
  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link href="/" className="text-sm text-blue-700 hover:underline">
          Back home
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Printable scan labels</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Code 128 labels for the assessment smoke paths. Print this page or scan from another screen.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {samples.map((sample) => (
          <article key={`${sample.label}-${sample.value}`} className="break-inside-avoid rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-950">{sample.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{sample.note}</p>
              </div>
            </div>
            <div className="mt-4 rounded border border-gray-200 bg-white p-3">
              <Code128Barcode value={sample.value} />
              <p className="mt-2 text-center font-mono text-sm font-semibold tracking-wide">
                {sample.value}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
