"use client";

import { ReceiveForm } from "@/components/ReceiveForm";

export default function TechReceivePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receive incoming asset</h1>
        <p className="text-gray-600 mt-2">
          Scan the asset tag to start. Fill in serial, model, manufacturer, and location details.
        </p>
      </div>

      <ReceiveForm />
    </div>
  );
}
