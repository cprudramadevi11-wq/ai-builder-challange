import { api } from "@/lib/api-client";
import { formatLocation, toRackLocation } from "@/lib/format";
import type { Asset, FacilitiesRecord, FinanceRecord } from "@/lib/types";

export type ReconcileSeverity = "critical" | "action" | "watch" | "expected";

export type ReconcileItem = {
  tag: string;
  title: string;
  explanation: string;
  severity: ReconcileSeverity;
  ops?: Asset;
  facilities?: FacilitiesRecord;
  finance?: FinanceRecord;
};

export type ReconcileCategory = {
  id: string;
  label: string;
  managerMeaning: string;
  severity: ReconcileSeverity;
  items: ReconcileItem[];
};

export type ReconcileReport = {
  generated_at: string;
  totals: {
    operations: number;
    facilities: number;
    finance: number;
    flagged: number;
  };
  categories: ReconcileCategory[];
};

function makeCategory(
  id: string,
  label: string,
  managerMeaning: string,
  severity: ReconcileSeverity,
): ReconcileCategory {
  return { id, label, managerMeaning, severity, items: [] };
}

export async function buildReconcileReport(): Promise<ReconcileReport> {
  const [assets, facilities, finance] = await Promise.all([
    api.assets.list(),
    api.mock.facilities(),
    api.mock.finance(),
  ]);

  const assetsByTag = new Map(assets.map((asset) => [asset.asset_tag, asset]));
  const facilitiesByTag = new Map(
    facilities.map((record) => [record.tagged_id, record]),
  );
  const financeByTag = new Map(finance.map((record) => [record.tag, record]));
  const allTags = new Set([
    ...assetsByTag.keys(),
    ...facilitiesByTag.keys(),
    ...financeByTag.keys(),
  ]);

  const categories = {
    rackDrift: makeCategory(
      "rack_drift",
      "Rack drift to investigate",
      "Operations says the asset is in service, but facilities has a different rack position.",
      "critical",
    ),
    missingRack: makeCategory(
      "missing_facilities",
      "Missing from facilities",
      "Operations says this asset is racked, but facilities has no row for it.",
      "action",
    ),
    extraRack: makeCategory(
      "unexpected_facilities",
      "Facilities-only rack rows",
      "Facilities sees a rack position that operations does not currently expect.",
      "action",
    ),
    financeMismatch: makeCategory(
      "finance_mismatch",
      "Finance status needs review",
      "Finance status or site no longer matches the operational record.",
      "watch",
    ),
    expectedScope: makeCategory(
      "expected_scope",
      "Expected system differences",
      "These differences come from each system's scope and do not need action today.",
      "expected",
    ),
  };

  for (const tag of allTags) {
    const ops = assetsByTag.get(tag);
    const fac = facilitiesByTag.get(tag);
    const fin = financeByTag.get(tag);

    if (!ops) {
      const target = fac ? categories.extraRack : categories.financeMismatch;
      target.items.push({
        tag,
        title: fac ? "Facilities has an unknown asset" : "Finance has no operations asset",
        explanation: fac
          ? "This rack row does not have a matching operations asset. Confirm the tag before removing it."
          : "Finance has a record that operations does not know about yet.",
        severity: target.severity,
        facilities: fac,
        finance: fin,
      });
      continue;
    }

    if (ops.state === "in_service") {
      const opsRack = toRackLocation(ops.location);
      if (!fac) {
        categories.missingRack.items.push({
          tag,
          title: "Racked in operations, absent in facilities",
          explanation: `${tag} is in service at ${formatLocation(
            ops.location,
          )}, but facilities has no rack row.`,
          severity: "action",
          ops,
          finance: fin,
        });
      } else if (fac.rack_location !== opsRack) {
        categories.rackDrift.items.push({
          tag,
          title: "Rack location disagrees",
          explanation: `Operations says ${opsRack}; facilities says ${fac.rack_location}.`,
          severity: "critical",
          ops,
          facilities: fac,
          finance: fin,
        });
      }
    } else if (fac) {
      const category =
        ops.state === "stored" || ops.state === "received"
          ? categories.extraRack
          : categories.financeMismatch;
      category.items.push({
        tag,
        title:
          ops.state === "disposed"
            ? "Disposed asset still appears in facilities"
            : "Non-racked asset still appears in facilities",
        explanation: `Operations state is ${ops.state}, so facilities should not list a live rack position.`,
        severity: category.severity,
        ops,
        facilities: fac,
        finance: fin,
      });
    }

    if (!fin) {
      categories.financeMismatch.items.push({
        tag,
        title: "Missing finance record",
        explanation: "Operations has the asset, but finance has no equipment row.",
        severity: "watch",
        ops,
        facilities: fac,
      });
    } else if (ops.state === "disposed" && fin.status !== "retired") {
      categories.financeMismatch.items.push({
        tag,
        title: "Disposed in operations, still active in finance",
        explanation: "Finance may be lagging disposal, or the asset was retired without the ERP update.",
        severity: "watch",
        ops,
        facilities: fac,
        finance: fin,
      });
    } else if (ops.state !== "disposed" && fin.status === "retired") {
      categories.financeMismatch.items.push({
        tag,
        title: "Active in operations, retired in finance",
        explanation: "Confirm whether the asset is truly active before month-end reporting.",
        severity: "watch",
        ops,
        facilities: fac,
        finance: fin,
      });
    } else if (fin.site && fin.site !== ops.location.site) {
      categories.financeMismatch.items.push({
        tag,
        title: "Finance site differs",
        explanation: `Operations site is ${ops.location.site}; finance site is ${fin.site}.`,
        severity: "watch",
        ops,
        facilities: fac,
        finance: fin,
      });
    } else if (ops.state !== "in_service" && !fac) {
      categories.expectedScope.items.push({
        tag,
        title: "Not racked by design",
        explanation: "Storage, receiving, RMA, and retired items are outside facilities rack tracking.",
        severity: "expected",
        ops,
        finance: fin,
      });
    }
  }

  const categoryList = Object.values(categories);
  const flagged = categoryList
    .filter((category) => category.severity !== "expected")
    .reduce((sum, category) => sum + category.items.length, 0);

  return {
    generated_at: new Date().toISOString(),
    totals: {
      operations: assets.length,
      facilities: facilities.length,
      finance: finance.length,
      flagged,
    },
    categories: categoryList,
  };
}
