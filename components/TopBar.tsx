"use client";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function TopBar({ title, onBack, right }: Props) {
  const { darkMode, toggleDark } = useStore();

  return (
    <div className="sticky top-0 z-40 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="flex items-center h-16 px-4 gap-3 max-w-lg mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface)] active:scale-95 transition-transform shrink-0"
          >
            <ChevronLeft size={22} className="text-[var(--foreground)]" />
          </button>
        )}
        <h1 className="flex-1 text-base font-bold text-[var(--foreground)] truncate">{title}</h1>
        <div className="flex items-center gap-2">
          {right}
          <button
            onClick={toggleDark}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface)] active:scale-95 transition-transform"
          >
            {darkMode
              ? <Sun size={20} className="text-[var(--muted)]" />
              : <Moon size={20} className="text-[var(--muted)]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
