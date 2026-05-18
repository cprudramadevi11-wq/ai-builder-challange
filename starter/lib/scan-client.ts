import { ApiError } from "@/lib/api-client";
import type {
  Asset,
  DeployScanInput,
  ReceiveScanInput,
  StoreScanInput,
  TransferScanInput,
} from "@/lib/types";

type ScanPayload =
  | ReceiveScanInput
  | StoreScanInput
  | DeployScanInput
  | TransferScanInput;

type ScanAction = "receive" | "store" | "deploy" | "transfer";

export async function postScan(
  action: ScanAction,
  input: ScanPayload,
): Promise<Asset> {
  const res = await fetch(`/api/scan/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = json?.error;
    throw new ApiError(
      res.status,
      error?.code ?? "unknown_error",
      error?.message ?? `HTTP ${res.status}`,
      error?.details,
    );
  }

  return json as Asset;
}
