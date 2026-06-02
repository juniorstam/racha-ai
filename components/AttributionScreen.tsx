"use client";
import { ChevronRight, AlertTriangle, Check, CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import TopBar from "./TopBar";
import StepBar from "./StepBar";

export default function AttributionScreen() {
  const { bill, setPersonQty, splitEvenly, setStep } = useStore();
  const { items, persons, attribution } = bill;

  // Cicla qty: 0 → 1 → 2 → … → disponível → 0
  // Para itens com qty=1: apenas toggle (várias pessoas podem marcar e dividem o custo)
  // Para itens com qty>1: cicla respeitando o total disponível
  const cycle = (itemId: string, personId: string, maxQty: number) => {
    const current = attribution[itemId]?.[personId] ?? 0;
    if (maxQty === 1) {
      // Toggle simples — múltiplas pessoas podem marcar e dividem igualmente
      setPersonQty(itemId, personId, current > 0 ? 0 : 1);
      return;
    }
    const assignedToOthers = Object.entries(attribution[itemId] ?? {})
      .filter(([pid]) => pid !== personId)
      .reduce((s, [, q]) => s + q, 0);
    const available = maxQty - assignedToOthers;
    const next = current >= available ? 0 : current + 1;
    setPersonQty(itemId, personId, next);
  };

  const totalAssigned = (itemId: string) =>
    Object.values(attribution[itemId] ?? {}).reduce((s, q) => s + q, 0);

  const pending = items.filter((i) => totalAssigned(i.id) === 0);
  const allDone = pending.length === 0;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar title="Quem consumiu?" onBack={() => setStep("persons")} />
      <StepBar current={2} />

      {!allDone && (
        <div className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#FEF3C7", border: "1px solid #F59E0B" }}>
          <AlertTriangle size={22} style={{ color: "#B45309" }} className="shrink-0" />
          <p className="text-sm font-bold" style={{ color: "#78350F" }}>
            {pending.length} {pending.length === 1 ? "item não atribuído" : "itens não atribuídos"}
          </p>
        </div>
      )}

      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {items.map((item) => {
          const qtys = attribution[item.id] ?? {};
          const assigned = totalAssigned(item.id);
          const totalPrice = item.quantity * item.unitPrice;
          // "Dividir todos" marca todos com qty=1 — isso é divisão igual independente da qty do item
          const isAllMarked = persons.length > 0 && persons.every((p) => (qtys[p.id] ?? 0) >= 1);
          const isComplete = assigned > 0;
          const isOver = item.quantity > 1 && !isAllMarked && assigned > item.quantity;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 bg-[var(--surface)] transition-all ${
                isOver
                  ? "border-red-400"
                  : isComplete
                  ? "border-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--foreground)] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.quantity}x {fmt(item.unitPrice)} = <span className="font-semibold">{fmt(totalPrice)}</span>
                    {assigned > 0 && !isOver && (() => {
                      const assignedPersons = Object.entries(qtys).filter(([, q]) => q > 0);
                      const isEvenSplit =
                        assignedPersons.length > 1 &&
                        assignedPersons.every(([, q]) => q === 1);
                      if (isEvenSplit) {
                        return (
                          <span className="text-brand">
                            {" · "}{fmt(totalPrice / assignedPersons.length)}/pessoa
                          </span>
                        );
                      }
                      return (
                        <span className="text-brand">
                          {" · "}
                          {assignedPersons
                            .map(([pid, q]) => {
                              const p = persons.find((p) => p.id === pid);
                              const share = (q / assigned) * totalPrice;
                              return `${p?.name.split(" ")[0]}: ${fmt(share)}`;
                            })
                            .join(" · ")}
                        </span>
                      );
                    })()}
                  </p>
                </div>
                {isComplete && !isOver && <Check size={16} className="text-[var(--accent)] shrink-0" />}
                {isOver && <span className="text-xs font-bold text-[var(--muted)] shrink-0">Excede!</span>}
              </div>

              {/* Chips com contador — clique cicla 0→1→2→…→max→0 */}
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {persons.map((p) => {
                  const qty = qtys[p.id] ?? 0;
                  const sel = qty > 0;
                  // Divisão igual: todos com qty=1 E item tem mais de 1 unidade
                  // Nesse caso mostra ✓ em vez do número (o "1" não representa quantidade)
                  const isEvenSplit =
                    persons.length > 1 &&
                    persons.every((pp) => (qtys[pp.id] ?? 0) === 1);

                  return (
                    <button
                      key={p.id}
                      onClick={() => cycle(item.id, p.id, item.quantity)}
                      className="h-11 px-4 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2 justify-center"
                      style={{
                        background: sel ? p.color : "var(--surface)",
                        color: sel ? "#fff" : "var(--foreground)",
                        border: sel ? "none" : "2px solid var(--border)",
                        fontSize: 15,
                        minWidth: 72,
                      }}
                    >
                      <span>{p.name.split(" ")[0]}</span>
                      {sel && isEvenSplit && <Check size={14} />}
                      {sel && !isEvenSplit && item.quantity > 1 && (
                        <span className="bg-white/30 rounded-full w-6 h-6 flex items-center justify-center text-sm font-black">
                          {qty}
                        </span>
                      )}
                      {sel && item.quantity === 1 && <Check size={14} />}
                    </button>
                  );
                })}
              </div>

              {/* Ações rápidas */}
              <div className="flex gap-2 px-4 pb-3">
                <button
                  onClick={() => splitEvenly(item.id)}
                  className="h-7 px-3 rounded-full text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20 active:scale-95 transition-transform flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Dividir todos
                </button>
                {/* Atalho: zerar */}
                {assigned > 0 && (
                  <button
                    onClick={() => persons.forEach((p) => setPersonQty(item.id, p.id, 0))}
                    className="h-7 px-3 rounded-full text-xs font-bold bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] active:scale-95 transition-transform"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)] px-4 py-3 max-w-lg mx-auto w-full">
        <div className="flex gap-2">
          <button
            onClick={() => setStep("persons")}
            className="h-12 px-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm text-[var(--foreground)] active:scale-95 transition-transform"
          >
            Voltar
          </button>
          <button
            onClick={() => setStep("fees")}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-[var(--accent)] text-white active:scale-95 transition-all"
          >
            {allDone ? "Próximo" : "Pular taxas"} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
