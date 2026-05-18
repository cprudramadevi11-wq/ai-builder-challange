import { NextResponse } from "next/server";
import { buildReconcileReport } from "@/lib/reconcile";

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await buildReconcileReport());
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "reconcile_failed",
          message:
            err instanceof Error
              ? err.message
              : "Could not build reconciliation report",
        },
      },
      { status: 500 },
    );
  }
}
