import { NextRequest, NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api-client";
import type {
  DeployScanInput,
  ReceiveScanInput,
  StoreScanInput,
  TransferScanInput,
} from "@/lib/types";
import { toRackLocation } from "@/lib/format";

type ScanAction = "receive" | "store" | "deploy" | "transfer";

function isScanAction(value: string): value is ScanAction {
  return ["receive", "store", "deploy", "transfer"].includes(value);
}

function jsonError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
      { status: err.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: err instanceof Error ? err.message : "Unexpected scan error",
      },
    },
    { status: 500 },
  );
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ action: string }> },
): Promise<NextResponse> {
  const { action } = await ctx.params;
  if (!isScanAction(action)) {
    return NextResponse.json(
      {
        error: {
          code: "unknown_scan_action",
          message: `Unknown scan action: ${action}`,
        },
      },
      { status: 404 },
    );
  }

  try {
    const body = await req.json();

    if (action === "receive") {
      const asset = await api.scans.receive(body as ReceiveScanInput);
      return NextResponse.json(asset);
    }

    if (action === "transfer") {
      const asset = await api.scans.transfer(body as TransferScanInput);
      return NextResponse.json(asset);
    }

    if (action === "store") {
      const input = body as StoreScanInput;
      const before = await api.assets.get(input.asset_tag);
      const asset = await api.scans.store(input);

      if (before.state === "in_service") {
        await api.mock.updateFacilities({
          tagged_id: asset.asset_tag,
          rack_location: null,
        });
      }

      return NextResponse.json(asset);
    }

    const input = body as DeployScanInput;
    const asset = await api.scans.deploy(input);
    await Promise.all([
      api.mock.updateFacilities({
        tagged_id: asset.asset_tag,
        rack_location: toRackLocation(asset.location),
      }),
      api.mock.updateFinance({
        tag: asset.asset_tag,
        site: asset.location.site,
        status: "capitalized",
        capitalized_on: new Date().toISOString().slice(0, 10),
      }),
    ]);

    return NextResponse.json(asset);
  } catch (err) {
    return jsonError(err);
  }
}
