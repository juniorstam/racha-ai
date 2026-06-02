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
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Sobe o sheet quando o teclado virtual abre (iOS Safari)
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setKeyboardOffset(0);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative w-full bg-[var(--background)] rounded-t-3xl shadow-2xl animate-slide-up max-h-[92vh] flex flex-col transition-transform duration-150"
        style={{ transform: `translateY(-${keyboardOffset}px)` }}
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
