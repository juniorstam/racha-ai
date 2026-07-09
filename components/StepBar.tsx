"use client";

const STEPS = ["Itens", "Pessoas", "Divisão", "Taxas", "Resultado"];

type Props = { current: number };

export default function StepBar({ current }: Props) {
  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-0.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="h-1 w-full rounded-full transition-all duration-300"
              style={{
                background: i < current
                  ? "var(--accent)"
                  : i === current
                  ? "var(--accent)"
                  : "#D1D5DB",
                opacity: i < current ? 0.45 : 1,
              }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-wide transition-colors"
              style={{
                color: i === current
                  ? "var(--accent)"
                  : i < current
                  ? "#6B7280"
                  : "#9CA3AF",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
