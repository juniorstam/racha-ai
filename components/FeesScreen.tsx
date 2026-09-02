"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronRight, Percent, DollarSign, User } from "lucide-react";
import { useStore, Fee, Discount } from "@/lib/store";
import { uid, fmt } from "@/lib/utils";
import TopBar from "./TopBar";
import StepBar from "./StepBar";
import BottomSheet from "./BottomSheet";
import AdBanner from "./AdBanner";

export default function FeesScreen() {
  const { bill, addFee, removeFee, addDiscount, removeDiscount, setStep, saveBill } = useStore();
  const [feeSheet, setFeeSheet] = useState(false);
  const [discSheet, setDiscSheet] = useState(false);
  const [feeType, setFeeType] = useState<Fee["type"]>("percent");
  const [feeLabel, setFeeLabel] = useState("");
  const [feeValue, setFeeValue] = useState("");
  const [discType, setDiscType] = useState<Discount["type"]>("percent");
  const [discLabel, setDiscLabel] = useState("");
  const [discValue, setDiscValue] = useState("");

  const subtotal = bill.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const openFeeSheet = () => {
    const current = bill.fees[0];
    if (current) {
      setFeeLabel(current.label);
      setFeeType(current.type);
      setFeeValue(String(current.value).replace(".", ","));
    } else {
      setFeeLabel("Taxa de Serviço");
      setFeeType("percent");
      setFeeValue("10");
    }
    setFeeSheet(true);
  };

  const quickSetFee = (pct: number) => {
    bill.fees.forEach((f) => removeFee(f.id));
    addFee({ id: uid(), label: `Taxa de Serviço ${pct}%`, type: "percent", value: pct });
    setFeeSheet(false);
  };

  const removeCurrentFee = () => {
    bill.fees.forEach((f) => removeFee(f.id));
    setFeeSheet(false);
  };

  const saveFee = () => {
    if (!feeLabel.trim() || !feeValue) return;
    bill.fees.forEach((f) => removeFee(f.id));
    addFee({
      id: uid(),
      label: feeLabel.trim(),
      type: feeType,
      value: parseFloat(feeValue.replace(",", ".")) || 0,
    });
    setFeeLabel(""); setFeeValue(""); setFeeSheet(false);
  };

  const saveDisc = () => {
    if (!discLabel.trim() || !discValue) return;
    addDiscount({
      id: uid(),
      label: discLabel.trim(),
      type: discType,
      value: parseFloat(discValue.replace(",", ".")) || 0,
    });
    setDiscLabel(""); setDiscValue(""); setDiscSheet(false);
  };

  const proceed = () => { saveBill(); setStep("result"); };

  const totalFees = bill.fees.reduce((s, f) => {
    if (f.type === "percent") return s + subtotal * (f.value / 100);
    if (f.type === "fixed") return s + f.value;
    if (f.type === "per-person") return s + f.value * bill.persons.length;
    return s;
  }, 0);

  const totalDiscs = bill.discounts.reduce((s, d) => {
    if (d.type === "percent") return s + subtotal * (d.value / 100);
    return s + d.value;
  }, 0);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar title="Taxas e Descontos" onBack={() => setStep("attribution")} />
      <StepBar current={3} />

      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Lista de itens — estilo cupom */}
        <div className="bg-[var(--surface)] rounded-2xl px-4 pt-3 pb-1 border border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Itens</p>
          <div className="flex flex-col gap-1 mb-2">
            {bill.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-[var(--muted)]">
                <span className="truncate flex-1 mr-2">{item.quantity > 1 ? `${item.quantity}x ` : ""}{item.name}</span>
                <span className="shrink-0">{fmt(item.quantity * item.unitPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subtotal */}
        <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)] font-medium">Subtotal</span>
            <span className="font-bold text-[var(--foreground)]">{fmt(subtotal)}</span>
          </div>
          {totalFees > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[var(--muted)] font-medium">Taxas</span>
              <span className="font-bold text-orange-500">+{fmt(totalFees)}</span>
            </div>
          )}
          {totalDiscs > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[var(--muted)] font-medium">Descontos</span>
              <span className="font-bold text-emerald-500">-{fmt(totalDiscs)}</span>
            </div>
          )}
          <div className="flex justify-between mt-2 pt-2 border-t border-[var(--border)]">
            <span className="font-bold text-[var(--foreground)]">Total</span>
            <span className="font-black text-[var(--foreground)] text-lg">{fmt(subtotal + totalFees - totalDiscs)}</span>
          </div>
        </div>

        {/* Taxa de serviço + desconto/cupom */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Taxas e Descontos</p>
          <div className="flex gap-2">
            <button
              onClick={openFeeSheet}
              className={`flex-1 h-12 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                bill.fees.length > 0
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] border-2 border-dashed border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {bill.fees.length > 0 ? feeChipLabel(bill.fees) : "+ Taxa de Serviço"}
            </button>
            <button
              onClick={() => setDiscSheet(true)}
              className="flex-1 h-12 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Desconto / Cupom
            </button>
          </div>
        </div>

        {/* Discounts list */}
        {bill.discounts.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Descontos</p>
            <div className="flex flex-col gap-2">
              {bill.discounts.map((d) => (
                <FeeRow key={d.id} label={d.label} value={`-${fmt(d.type === "percent" ? subtotal * d.value / 100 : d.value)}`} onRemove={() => removeDiscount(d.id)} isDiscount />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)] px-4 py-3 max-w-lg mx-auto w-full">
        <AdBanner slot={process.env.NEXT_PUBLIC_AD_SLOT_FEES} />
        <div className="flex gap-2">
          <button
            onClick={() => setStep("attribution")}
            className="h-12 px-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm text-[var(--foreground)] active:scale-95 transition-transform"
          >
            Voltar
          </button>
          <button
            onClick={proceed}
            className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-[var(--accent)] text-white active:scale-95 transition-all"
          >
            Ver Resultado <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Fee sheet */}
      <BottomSheet open={feeSheet} onClose={() => setFeeSheet(false)} title="Taxa de Serviço">
        <div className="px-4 pb-8 flex flex-col gap-3">
          {bill.fees.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex-1">
                <p className="font-bold text-[var(--foreground)] text-sm">{bill.fees[0].label}</p>
                <p className="text-xs font-semibold text-orange-500">{feeDisplay(bill.fees[0], subtotal, bill.persons.length)}</p>
              </div>
              <button onClick={removeCurrentFee} className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center active:scale-95 transition-transform">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {[10, 15].map((pct) => (
              <button
                key={pct}
                onClick={() => quickSetFee(pct)}
                className="flex-1 h-10 rounded-2xl text-xs font-bold bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all"
              >
                {pct}%
              </button>
            ))}
          </div>
          <input
            className="h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)]"
            placeholder="Nome (ex: Couvert, Gorjeta...)"
            value={feeLabel}
            onChange={(e) => setFeeLabel(e.target.value)}
          />
          <div className="flex gap-2">
            {([
              { v: "percent", icon: Percent, label: "% do total" },
              { v: "fixed", icon: DollarSign, label: "Valor fixo" },
              { v: "per-person", icon: User, label: "Por pessoa" },
            ] as const).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setFeeType(v)}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  feeType === v ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <input
            className="h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)]"
            placeholder={feeType === "percent" ? "Ex: 10" : "Ex: 15,00"}
            value={feeValue}
            onChange={(e) => setFeeValue(e.target.value)}
            inputMode="decimal"
          />
          <button onClick={saveFee} disabled={!feeLabel.trim() || !feeValue} className="h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform">
            Salvar Taxa
          </button>
        </div>
      </BottomSheet>

      {/* Discount sheet */}
      <BottomSheet open={discSheet} onClose={() => setDiscSheet(false)} title="Adicionar Desconto">
        <div className="px-4 pb-8 flex flex-col gap-3">
          <input
            className="h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)]"
            placeholder="Nome (ex: Cupom RACHA10)"
            value={discLabel}
            onChange={(e) => setDiscLabel(e.target.value)}
          />
          <div className="flex gap-2">
            {([
              { v: "percent", icon: Percent, label: "Percentual" },
              { v: "fixed", icon: DollarSign, label: "Valor fixo" },
            ] as const).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setDiscType(v)}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  discType === v ? "bg-emerald-500 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <input
            className="h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)]"
            placeholder={discType === "percent" ? "Ex: 10" : "Ex: 20,00"}
            value={discValue}
            onChange={(e) => setDiscValue(e.target.value)}
            inputMode="decimal"
          />
          <button onClick={saveDisc} disabled={!discLabel.trim() || !discValue} className="h-14 rounded-2xl bg-emerald-500 text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform">
            Adicionar Desconto
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function FeeRow({ label, value, onRemove, isDiscount }: { label: string; value: string; onRemove: () => void; isDiscount?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex-1">
        <p className="font-bold text-[var(--foreground)] text-sm">{label}</p>
        <p className={`text-xs font-semibold ${isDiscount ? "text-emerald-500" : "text-orange-500"}`}>{value}</p>
      </div>
      <button onClick={onRemove} className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center active:scale-95 transition-transform">
        <Trash2 size={14} className="text-red-500" />
      </button>
    </div>
  );
}

function feeDisplay(fee: Fee, subtotal: number, personCount: number): string {
  if (fee.type === "percent") return `+${fmt(subtotal * fee.value / 100)} (${fee.value}%)`;
  if (fee.type === "fixed") return `+${fmt(fee.value)}`;
  return `+${fmt(fee.value * personCount)} (${fmt(fee.value)}/pessoa)`;
}

function feeChipLabel(fees: Fee[]): string {
  if (fees.length > 1) return `${fees.length} taxas`;
  const fee = fees[0];
  if (fee.type === "percent") return `${fee.value}%`;
  if (fee.type === "fixed") return fmt(fee.value);
  return `${fmt(fee.value)}/pessoa`;
}
