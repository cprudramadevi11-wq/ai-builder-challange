# Asset Control Center

Production-minded completion of the asset tracking coding challenge. The app supports technician scan workflows, manager fleet review, three-way reconciliation, and printable scan labels on top of the provided Fastify API.

## What is implemented

- Technician workflows: receive, store, deploy, and custody transfer under `/tech`.
- Receive idempotency UX: duplicate matching serials record cleanly; mismatched serials show the serial on file.
- Store/deploy scan flow: asset scan plus manual, handheld, camera, or barcode-driven location entry.
- Phone camera scanning: native `BarcodeDetector` support on compatible mobile browsers, with a clear fallback when unavailable.
- Server-side scan proxy: deploy and de-rack write back to facilities and finance without exposing `API_TOKEN` to the browser.
- Manager dashboard: search, filter, sort, client-side pagination, and asset detail pages with newest-first event history.
- Reconciliation: server-side join of operations, facilities, and finance with categories ranked for manager action.
- Printable labels: `/dev/barcodes` generates Code 128 labels for smoke-test assets, a transfer badge, and useful locations.

## Running locally

```bash
pnpm install
pnpm dev
```

The API runs on `http://localhost:8080` and the Next.js app runs on `http://localhost:3000`.

The starter app reads these server-only variables:

```bash
API_BASE_URL=http://localhost:8080/v1
API_TOKEN=local-dev-token
```

The local API does not enforce auth, but the frontend intentionally keeps the token server-side to match the hosted challenge contract.

## Verification

Useful commands:

```bash
pnpm --filter @asset-tracking/api test
pnpm --filter @asset-tracking/starter test
pnpm --filter @asset-tracking/starter typecheck
pnpm build
```

Before recording a demo, reset the data:

```bash
curl -X POST http://localhost:3000/api/upstream/reset
```

Then walk the happy path in `starter/docs/happy-path.md`. Use `/dev/barcodes` for scannable asset, badge, and location labels.

## Architecture

Browser code calls either the typed API client through `/api/upstream/*` or the scan-specific route at `/api/scan/[action]`. The generic upstream proxy attaches the bearer token server-side. The scan route is intentionally separate because successful deploy and store-from-in-service actions need follow-up writes to mock facilities and finance.

Reconciliation lives in `starter/lib/reconcile.ts` and is exposed by `app/api/reconcile/route.ts`. The page renders the same server-side report and keeps the join logic testable outside of the UI.

The backend API remains small and deterministic: SQLite for operations data, in-memory overlays for mock facilities and finance writes, and reset support for repeatable demos.

## Reconciliation categories

- Rack drift to investigate: operations and facilities both see an in-service asset, but the rack position differs.
- Missing from facilities: operations says the asset is racked, but facilities has no row.
- Facilities-only rack rows: facilities sees a rack location that operations does not currently expect.
- Finance status needs review: finance is missing, retired while operations is active, active while operations is disposed, or points at a different site.
- Expected system differences: assets in receiving, storage, RMA, or disposal that are outside facilities rack tracking.

## Three calls I nearly made the other way

1. I nearly put facilities and finance writebacks in the browser after each scan. The simpler client code was tempting, but it would either expose the token or create a second browser-facing credential path. The server scan route keeps the security boundary consistent with reconciliation.

2. I nearly made reconciliation a raw diff table. That would surface every mismatch, but it would make the manager do the classification work. The shipped report ranks differences by operational meaning so the first screen answers "what needs attention today?"

3. I nearly added a camera-scanning dependency. The challenge allows libraries like ZXing, but adding one late would increase install risk for a small path. I used the browser's native `BarcodeDetector` API instead, with the same scan handlers as the keyboard path and a clear fallback when the browser does not support it.

## Pushback and notes

- The brief says there are "three scan endpoints" but later requires transfer as a fourth scan workflow and the API includes `/v1/scans/transfer`.
- The starter README still claimed the reconciliation route returned 501, while the current repository already had a real route handler.
- Browser `api.health()` was documented as going through `/api/upstream/health`, but the proxy originally forwarded that to `/v1/health`. The proxy now special-cases health to the upstream root.

## Tradeoffs and future improvements

- Pagination is client-side because the API returns about 1,000 rows and has only basic filters. If this grew, I would add API pagination and server-side table state.
- Mock writebacks are best effort after the operations scan succeeds. A real system would queue or retry downstream writes and show sync status separately from the physical scan result.
- Location barcodes use a simple `LOC|Site|Room|Row|Rack|RU` payload. A production label format should include versioning and a checksum.
- Native camera scanning depends on browser support for `BarcodeDetector`. A production version could add ZXing as a fallback for Safari and older mobile browsers.
