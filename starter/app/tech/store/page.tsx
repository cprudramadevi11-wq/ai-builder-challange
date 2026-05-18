import { ScanWorkflow } from "@/components/ScanWorkflow";

export default function TechStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store asset</h1>
        <p className="text-gray-600 mt-2">
          Scan the asset, confirm its current state, then record the storage
          location. If it was racked, this also removes it from facilities.
        </p>
      </div>
      <ScanWorkflow kind="store" />
    </div>
  );
}
