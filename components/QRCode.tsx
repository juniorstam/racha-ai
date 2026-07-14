"use client";
import { useEffect, useRef } from "react";

type Props = { value: string; size?: number };

export default function QRCode({ value, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QR) => {
      if (cancelled || !canvasRef.current) return;
      QR.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: { dark: "#10B981", light: "#ffffff" },
      });
    });
    return () => { cancelled = true; };
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-2xl shadow-md" />
      <p className="text-xs text-[var(--muted)] text-center">Aponte a câmera para pagar via PIX</p>
    </div>
  );
}
