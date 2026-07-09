"use client";
import { useState } from "react";
import { Share2, Copy, Check, RotateCcw, QrCode, ChevronDown, ChevronUp, Wallet, CheckCircle2, Circle } from "lucide-react";
import { useStore, BillResult } from "@/lib/store";
import { fmt, shareText, copyText } from "@/lib/utils";
import TopBar from "./TopBar";
import BottomSheet from "./BottomSheet";
import QRCode from "./QRCode";

export default function ResultScreen() {
  const { computeResults, resetBill, bill, setStep, togglePaid } = useStore();
  const results = computeResults();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixSheet, setPixSheet] = useState(false);
  const [pixPerson, setPixPerson] = useState<BillResult | null>(null);
  const [pixKey, setPixKey] = useState("");

  const total = results.reduce((s, r) => s + r.total, 0);
  const paidPersonIds = bill.paidPersonIds ?? [];
  const paidResults = results.filter((r) => paidPersonIds.includes(r.personId));
  const remaining = total - paidResults.reduce((s, r) => s + r.total, 0);
  const allPaid = results.length > 0 && paidResults.length === results.length;

  const shareMsg = () => {
    const lines = results.map((r) => `${r.name}: ${fmt(r.total)}`);
    const text = `🤝 Racha Aí\n\n${lines.join("\n")}\n\nTotal: ${fmt(total)}`;
    shareText(text);
  };

  const copyMsg = () => {
    const lines = results.map((r) => `${r.name}: ${fmt(r.total)}`);
    const text = `🤝 Racha Aí\n\n${lines.join("\n")}\n\nTotal: ${fmt(total)}`;
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPix = (r: BillResult) => { setPixPerson(r); setPixKey(""); setPixSheet(true); };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar
        title="Resultado"
        onBack={() => setStep("fees")}
        right={
          <button
            onClick={resetBill}
            className="w-9 h-9 rounded-2xl bg-[var(--surface)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <RotateCcw size={18} className="text-[var(--accent)]" />
          </button>
        }
      />

      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Summary card */}
        <div className="bg-[var(--accent)] rounded-3xl p-5 text-white shadow-xl ">
          <p className="text-sm font-semibold opacity-80">{bill.name} · {bill.persons.length} pessoas</p>
          <p className="text-4xl font-black mt-1 tracking-tight">{fmt(total)}</p>
          <p className="text-sm opacity-70 mt-0.5">Total da conta</p>

          {paidPersonIds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              {allPaid ? (
                <p className="text-sm font-bold">🎉 Tudo pago!</p>
              ) : (
                <p className="text-sm font-bold">Falta receber: {fmt(remaining)}</p>
              )}
              <p className="text-xs opacity-70 mt-0.5">
                ✓ {paidResults.map((r) => r.name).join(", ")} {paidResults.length === 1 ? "pagou" : "pagaram"}
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={shareMsg}
              className="flex-1 h-10 rounded-2xl bg-white/20 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Share2 size={15} /> Compartilhar
            </button>
            <button
              onClick={copyMsg}
              className="flex-1 h-10 rounded-2xl bg-white/20 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Per-person cards */}
        {results.map((r) => {
          const isOpen = expanded === r.personId;
          const isPaid = paidPersonIds.includes(r.personId);
          return (
            <div key={r.personId} className={`rounded-2xl bg-[var(--surface)] border overflow-hidden animate-fade-in transition-colors ${isPaid ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
              <button
                onClick={() => setExpanded(isOpen ? null : r.personId)}
                className="w-full flex items-center gap-3 p-4 active:bg-[var(--border)]/30 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                  style={{ background: r.color }}
                >
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[var(--foreground)]">{r.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {r.items.length} {r.items.length === 1 ? "item" : "itens"}
                    {r.fees > 0 && ` · +${fmt(r.fees)} taxas`}
                    {r.discounts > 0 && ` · -${fmt(r.discounts)} desc.`}
                    {isPaid && <span className="text-[var(--accent)] font-bold"> · ✓ Pago</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[var(--foreground)] text-lg">{fmt(r.total)}</p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-[var(--muted)] shrink-0" /> : <ChevronDown size={16} className="text-[var(--muted)] shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-[var(--border)] animate-fade-in">
                  <div className="pt-3 flex flex-col gap-1.5">
                    {r.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-[var(--muted)] truncate flex-1">{item.name}</span>
                        <span className="font-semibold text-[var(--foreground)] ml-2">{fmt(item.amount)}</span>
                      </div>
                    ))}
                    {r.fees > 0 && (
                      <div className="flex justify-between text-sm pt-1 border-t border-[var(--border)]">
                        <span className="text-[var(--muted)]">Taxas</span>
                        <span className="font-semibold text-orange-500">+{fmt(r.fees)}</span>
                      </div>
                    )}
                    {r.discounts > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)]">Descontos</span>
                        <span className="font-semibold text-emerald-500">-{fmt(r.discounts)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--border)]">
                      <span className="text-[var(--foreground)]">Total</span>
                      <span className="text-[var(--foreground)]">{fmt(r.total)}</span>
                    </div>
                    <button
                      onClick={() => openPix(r)}
                      className="mt-2 w-full h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <QrCode size={15} /> PIX / QR Code
                    </button>
                    <button
                      onClick={() => togglePaid(r.personId)}
                      className={`w-full h-10 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ${
                        isPaid
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      {isPaid ? `${r.name} pagou` : `Marcar ${r.name} como pago`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* espaço para o botão fixo não cobrir o último card */}
        <div className="h-20" />
      </div>

      {/* Botão fixo — Nova Conta */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent">
        <button
          onClick={resetBill}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-500 text-white font-bold text-base active:scale-95 transition-transform shadow-lg"
          style={{ display: "flex" }}
        >
          <RotateCcw size={18} /> Nova Conta
        </button>
      </div>

      {/* PIX Sheet */}
      <BottomSheet open={pixSheet} onClose={() => setPixSheet(false)} title={`PIX de ${pixPerson?.name}`}>
        <div className="px-4 pb-8 flex flex-col gap-4 items-center">
          <div className="w-full bg-[var(--surface)] rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-[var(--foreground)]">{pixPerson && fmt(pixPerson.total)}</p>
            <p className="text-sm text-[var(--muted)] mt-1">a receber de {pixPerson?.name}</p>
          </div>
          <div className="w-full">
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">
              Sua chave PIX (CPF, email, telefone ou aleatória)
            </label>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              para receber o PIX de {pixPerson?.name}
            </p>
            <input
              className="mt-1 w-full h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)] transition-colors"
              placeholder="Ex: 123.456.789-00"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
          </div>
          {pixKey && pixPerson && (
            <QRCode
              value={`00020126580014br.gov.bcb.pix0136${pixKey}5204000053039865406${pixPerson.total.toFixed(2).replace(".", "")}5802BR5913RachaAi6009SAO PAULO62070503***6304`}
            />
          )}
          {!pixKey && (
            <div className="flex flex-col items-center text-center py-6 text-[var(--muted)]">
              <Wallet size={36} className="mb-2 opacity-40" />
              <p className="text-sm">Insira sua chave PIX para gerar o QR Code</p>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
