import { ScanWorkflow } from "@/components/ScanWorkflow";

export default function TechDeployPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deploy asset</h1>
        <p className="text-gray-600 mt-2">
          Scan the asset, then record the rack position. Deploy requires site,
          room, rack, and RU and updates operations, facilities, and finance.
        </p>
      </div>
      <ScanWorkflow kind="deploy" />
    </div>
  );
}
