"use client";

import { useEffect, useId, useRef } from "react";
import { CameraScanner } from "@/components/CameraScanner";

export interface ScanInputProps {
  onScan: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  label?: string;
  camera?: boolean;
}

export function ScanInput({
  onScan,
  placeholder = "Scan or type a tag and press Enter...",
  autoFocus = true,
  disabled = false,
  label,
  camera = true,
}: ScanInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (autoFocus && ref.current && !disabled) {
      ref.current.focus();
    }
  }, [autoFocus, disabled]);

  function fire(): void {
    const el = ref.current;
    if (!el) return;
    const v = el.value.trim();
    if (!v) return;
    onScan(v);
    el.value = "";
    el.focus();
  }

  function handleCameraScan(value: string): void {
    onScan(value.trim());
    ref.current?.focus();
  }

  return (
    <div>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full text-lg p-4 min-h-[44px] rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            fire();
          }
        }}
      />
      {camera ? <CameraScanner disabled={disabled} onScan={handleCameraScan} /> : null}
    </div>
  );
}
