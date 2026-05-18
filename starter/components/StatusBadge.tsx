import type { AssetState } from "@/lib/types";
import { humanize, stateTone } from "@/lib/format";

export function StatusBadge({ state }: { state: AssetState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${stateTone(
        state,
      )}`}
    >
      {humanize(state)}
    </span>
  );
}

