# Asset Control Center frontend

Next.js App Router implementation for the asset tracking challenge.

## Run

```bash
pnpm install
pnpm dev
```

From this package only:

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm test
```

## Environment

```bash
API_BASE_URL=http://localhost:8080/v1
API_TOKEN=local-dev-token
```

Browser requests go through `/api/upstream/*` or `/api/scan/[action]`; the token is attached only on the server.

## Routes

- `/tech` - technician workflow launcher.
- `/tech/receive` - asset intake with duplicate and serial-conflict handling.
- `/tech/store` - store workflow with asset scan and location scan/manual entry.
- `/tech/deploy` - deploy workflow with rack validation and downstream mock writes.
- `/tech/transfer` - two-sided custody handoff.
- `/manager` - searchable, filterable, sortable asset list.
- `/manager/assets/[tag]` - asset detail and event history.
- `/manager/reconcile` - categorized three-system reconciliation report.
- `/dev/barcodes` - printable Code 128 labels for smoke tests.

## Notes

The frontend keeps the challenge API token server-side. Deploy and store-from-in-service scans use `app/api/scan/[action]` so operations, facilities, and finance updates are coordinated from one server route.

Scan inputs support keyboard/handheld scanner entry and native camera scanning through `BarcodeDetector` on compatible browsers. Unsupported browsers keep the manual/handheld path visible and explain the fallback.
