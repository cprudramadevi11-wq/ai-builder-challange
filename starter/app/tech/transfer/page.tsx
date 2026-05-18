import { TransferWorkflow } from "@/components/TransferWorkflow";

export default function TechTransferPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transfer custody</h1>
        <p className="text-gray-600 mt-2">
          Scan the asset, then scan the receiving badge. The asset state stays
          the same; only custody changes.
        </p>
      </div>
      <TransferWorkflow />
    </div>
  );
}
