"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function BottomSheet({ open, onClose, children, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [vpTop, setVpTop] = useState(0);
  const [vpHeight, setVpHeight] = useState<number | null>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Segue o visual viewport do iOS (abre acima do teclado)
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setVpTop(vv.offsetTop);
      setVpHeight(vv.height);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setVpTop(0);
      setVpHeight(null);
    };
  }, [open]);

  if (!open) return null;

  const containerStyle: React.CSSProperties = vpHeight !== null
    ? { position: "fixed", top: vpTop, left: 0, right: 0, height: vpHeight, zIndex: 50, display: "flex", alignItems: "flex-end" }
    : { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" };

  return (
    <div style={containerStyle}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative w-full bg-[var(--background)] rounded-t-3xl shadow-2xl animate-slide-up flex flex-col"
        style={{ maxHeight: vpHeight ? vpHeight * 0.92 : "92vh" }}
      >
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>
        {title && (
          <div className="px-5 pb-3 pt-1 shrink-0">
            <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto flex-1 no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
