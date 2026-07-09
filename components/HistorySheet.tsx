"use client";
import { useStore } from "@/lib/store";
import BottomSheet from "./BottomSheet";
import { fmt, formatDate } from "@/lib/utils";
import { Clock, ChevronRight, Trash2 } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export default function HistorySheet({ open, onClose }: Props) {
  const { history, loadBill, setBill } = useStore();

  const load = (id: string) => {
    loadBill(id);
    onClose();
  };

  if (!history.length) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Histórico">
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
          <Clock size={40} className="text-[var(--muted)] mb-4" />
          <p className="font-bold text-[var(--foreground)]">Nenhuma conta salva</p>
          <p className="text-sm text-[var(--muted)] mt-1">Suas divisões aparecerão aqui</p>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Histórico">
      <div className="px-4 pb-8 flex flex-col gap-2">
        {history.map((bill) => {
          const total = bill.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
          return (
            <button
              key={bill.id}
              onClick={() => load(bill.id)}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--foreground)] truncate">{bill.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {formatDate(bill.createdAt)} · {bill.persons.length} pessoas · {fmt(total)}
                </p>
              </div>
              <ChevronRight size={16} className="text-[var(--muted)] shrink-0" />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
