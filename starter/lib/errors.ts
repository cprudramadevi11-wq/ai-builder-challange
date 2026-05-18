import { ApiError } from "@/lib/api-client";

export type UiError = {
  title: string;
  message: string;
};

export function toUiError(err: unknown, fallback: string): UiError {
  if (!(err instanceof ApiError)) {
    return {
      title: "Could not finish the scan",
      message: fallback,
    };
  }

  switch (err.code) {
    case "and_match_failed":
      return {
        title: "Tag belongs to another serial",
        message: `This tag is already paired with ${String(
          err.details?.expected_serial ?? "a different serial",
        )}. You entered ${String(err.details?.provided_serial ?? "a new serial")}.`,
      };
    case "invalid_tag_format":
      return {
        title: "Asset tag is not valid",
        message: "Asset tags use C followed by seven digits, like C0009001.",
      };
    case "unknown_asset":
      return {
        title: "Asset not found",
        message: "Receive the asset first, then try this workflow again.",
      };
    case "invalid_transition":
      return {
        title: "Wrong workflow for this asset",
        message: `Current state is ${String(
          err.details?.from_state ?? "not available",
        )}. Choose the workflow that matches the physical move.`,
      };
    case "incomplete_deploy_location":
      return {
        title: "Rack position is incomplete",
        message: "Deploy needs site, room, rack, and RU before the scan can post.",
      };
    case "same_custodian":
      return {
        title: "Custodian is unchanged",
        message: "Scan a different receiving badge to complete the handoff.",
      };
    default:
      return {
        title: err.message ? "Scan failed" : "Could not finish the scan",
        message: err.message || fallback,
      };
  }
}
