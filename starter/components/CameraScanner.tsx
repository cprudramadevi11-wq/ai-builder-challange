"use client";

import { useEffect, useRef, useState } from "react";

type BarcodeDetectorShape = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorShape;

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  const detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;
  return detector ?? null;
}

export function CameraScanner({
  disabled = false,
  onScan,
}: {
  disabled?: boolean;
  onScan: (value: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function stopCamera(): void {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setOpen(false);
  }

  useEffect(() => stopCamera, []);

  async function startCamera(): Promise<void> {
    setMessage(null);

    if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
      setMessage("Camera scanning is not available in this browser. Use a handheld scanner or type the value.");
      return;
    }

    const Detector = getBarcodeDetector();
    if (!Detector) {
      setMessage("This browser does not support camera barcode detection. Chrome or Edge on a phone works best.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setOpen(true);

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const detector = new Detector({
        formats: ["code_128", "qr_code", "code_39", "ean_13"],
      });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue?.trim();
          if (value) {
            onScan(value);
            stopCamera();
            return;
          }
        } catch {
          setMessage("The camera is open, but the label is not readable yet. Hold steady and fill the frame.");
        }
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setMessage("Camera permission was blocked. Allow camera access or use the text scan field.");
      stopCamera();
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={open ? stopCamera : startCamera}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {open ? "Close camera" : "Use camera"}
        </button>
      </div>

      {message ? (
        <p className="mt-2 text-sm text-amber-800" role="status">
          {message}
        </p>
      ) : null}

      {open ? (
        <div className="mt-3 overflow-hidden rounded-lg border-2 border-gray-900 bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-video w-full object-cover"
            aria-label="Camera barcode scanner"
          />
          <div className="border-t border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white">
            Center one barcode in the frame. The scan posts automatically when read.
          </div>
        </div>
      ) : null}
    </div>
  );
}
