"use client";

import type { Location } from "@/lib/types";
import { useState } from "react";

export interface LocationInputProps {
  value: Location;
  onChange: (location: Location) => void;
  disabled?: boolean;
  label?: string;
  requireRack?: boolean;
  requireRu?: boolean;
}

export function LocationInput({
  value,
  onChange,
  disabled = false,
  label = "Location",
  requireRack = false,
  requireRu = false,
}: LocationInputProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(
    key: keyof Location,
    fieldValue: string | null,
  ): void {
    const newLocation = { ...value, [key]: fieldValue || null };
    onChange(newLocation);
    // Clear error for this field when user edits
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  return (
    <fieldset className="space-y-3 border rounded-lg p-4 bg-gray-50" disabled={disabled}>
      <legend className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </legend>

      {/* Site (required) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Site <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={value.site}
          onChange={(e) => handleChange("site", e.target.value)}
          placeholder="e.g., Lab-A"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        />
        {errors.site && (
          <p className="text-xs text-red-600 mt-1">{errors.site}</p>
        )}
      </div>

      {/* Room (required for deploy, optional otherwise) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Room <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={value.room || ""}
          onChange={(e) => handleChange("room", e.target.value)}
          placeholder="e.g., Room-101"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        />
      </div>

      {/* Row (optional) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Row
        </label>
        <input
          type="text"
          value={value.row || ""}
          onChange={(e) => handleChange("row", e.target.value)}
          placeholder="e.g., A"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        />
      </div>

      {/* Rack (optional) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Rack {requireRack ? <span className="text-red-600">*</span> : null}
        </label>
        <input
          type="text"
          value={value.rack || ""}
          onChange={(e) => handleChange("rack", e.target.value)}
          placeholder="e.g., R1"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        />
      </div>

      {/* RU (optional for storage, required for deploy) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          RU (Rack Unit) {requireRu ? <span className="text-red-600">*</span> : null}
        </label>
        <input
          type="text"
          value={value.ru || ""}
          onChange={(e) => handleChange("ru", e.target.value)}
          placeholder="e.g., 42"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        />
      </div>
    </fieldset>
  );
}
