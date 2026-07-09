"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Mic, MicOff, Camera, Calculator, ChevronRight, X, Check } from "lucide-react";
import { useStore, BillItem } from "@/lib/store";
import { uid, fmtShort, parseVoiceInput, parseOCRText, fmt } from "@/lib/utils";
import TopBar from "./TopBar";
import StepBar from "./StepBar";
import BottomSheet from "./BottomSheet";
import CalcSheet from "./CalcSheet";

export default function ItemsScreen() {
  const { bill, addItem, updateItem, removeItem, setStep } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [calcOpen, setCalcOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceSheet, setVoiceSheet] = useState(false);
  const [ocrSheet, setOcrSheet] = useState(false);
  const [ocrText, setOcrText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onVoice = () => openVoice();
    const onOcr = () => setOcrSheet(true);
    window.addEventListener("racha-start-voice", onVoice);
    window.addEventListener("racha-start-ocr", onOcr);
    return () => {
      window.removeEventListener("racha-start-voice", onVoice);
      window.removeEventListener("racha-start-ocr", onOcr);
    };
  }, []);

  const openAdd = (item?: BillItem) => {
    if (item) {
      setEditId(item.id);
      setName(item.name);
      setQty(String(item.quantity));
      setPrice(fmtShort(item.unitPrice));
      setNote(item.note ?? "");
    } else {
      setEditId(null);
      setName("");
      setQty("1");
      setPrice("");
      setNote("");
    }
    setShowAdd(true);
  };

  const save = () => {
    if (!name.trim() || !price) return;
    const unitPrice = parseFloat(price.replace(/\./g, "").replace(",", ".")) || 0;
    const quantity = parseInt(qty) || 1;
    if (editId) {
      updateItem(editId, { name: name.trim(), quantity, unitPrice, note: note.trim() || undefined });
    } else {
      addItem({ id: uid(), name: name.trim(), quantity, unitPrice, note: note.trim() || undefined });
    }
    setShowAdd(false);
  };

  const openVoice = () => {
    setVoiceText("");
    setVoiceSheet(true);
    startListening();
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Seu navegador não suporta reconhecimento de voz."); return; }
    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = true;
    r.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setVoiceText(t);
    };
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const applyVoice = () => {
    const items = parseVoiceInput(voiceText);
    items.forEach((i) => addItem({ id: uid(), ...i }));
    setVoiceSheet(false);
    setVoiceText("");
  };

  const [ocrLoading, setOcrLoading] = useState(false);

  // Redimensiona e comprime a foto no navegador antes de enviar —
  // fotos de câmera (4-8MB) estouram o limite de payload de funções serverless (4.5MB na Vercel)
  const compressImage = (file: File, maxDim = 1920, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        URL.revokeObjectURL(url);
        if (!ctx) { reject(new Error("canvas indisponível")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("falha ao carregar imagem")); };
      img.src = url;
    });
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setOcrSheet(true);
    setOcrLoading(true);
    setOcrText("");
    try {
      const base64 = await compressImage(file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: "image/jpeg" }),
      });

      if (!res.ok) throw new Error(`OCR request failed: ${res.status}`);
      const data = await res.json();
      const itens: { qty: number; name: string; unit: number }[] = data.itens ?? [];

      if (itens.length > 0) {
        itens.forEach((item) => {
          addItem({
            id: uid(),
            name: item.name,
            quantity: item.qty ?? 1,
            unitPrice: item.unit ?? 0,
          });
        });
        setOcrSheet(false);
      } else {
        setOcrText("Não consegui identificar itens. Edite o texto abaixo:");
      }
    } catch {
      setOcrText("Erro ao processar a foto. Edite o texto abaixo:");
    } finally {
      setOcrLoading(false);
    }
  };

  const applyOcr = () => {
    const items = parseOCRText(ocrText);
    if (items.length) items.forEach((i) => addItem({ id: uid(), ...i }));
    setOcrSheet(false);
    setOcrText("");
  };

  const total = bill.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const canProceed = bill.items.length > 0;

  const formatPrice = (v: string) => {
    const nums = v.replace(/\D/g, "");
    if (!nums) return "";
    const n = parseInt(nums) / 100;
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar
        title={bill.name}
        onBack={() => setStep("home")}
        right={
          <div className="flex gap-2">
            <button
              onClick={() => setOcrSheet(true)}
              className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Camera size={22} className="text-[var(--accent)]" />
            </button>
            <button
              onClick={openVoice}
              className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Mic size={22} className="text-[var(--accent)]" />
            </button>
          </div>
        }
      />
      <StepBar current={0} />

      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full">
        {bill.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-5">
              <span className="text-4xl">🧾</span>
            </div>
            <p className="text-xl font-bold text-[var(--foreground)]">Nenhum item ainda</p>
            <p className="text-base text-[var(--muted)] mt-2">Adicione os itens consumidos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bill.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-fade-in"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--foreground)] text-base truncate">{item.name}</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {item.quantity}x · {fmt(item.unitPrice)} un · <span className="font-semibold text-[var(--foreground)]">{fmt(item.quantity * item.unitPrice)}</span>
                  </p>
                </div>
                <button onClick={() => openAdd(item)} className="w-11 h-11 rounded-xl bg-[var(--surface)] flex items-center justify-center active:scale-95 transition-transform">
                  <Edit2 size={20} className="text-[var(--muted)]" />
                </button>
                <button onClick={() => removeItem(item.id)} className="w-11 h-11 rounded-xl bg-[var(--surface)] flex items-center justify-center active:scale-95 transition-transform">
                  <Trash2 size={20} className="text-[var(--muted)]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)] px-4 py-3 max-w-lg mx-auto w-full">
        {total > 0 && (
          <p className="text-center text-sm font-bold text-[var(--muted)] mb-2">
            Total: <span className="text-[var(--foreground)]">{fmt(total)}</span>
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => openAdd()}
            className="flex-1 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center gap-2 font-bold text-sm text-[var(--foreground)] active:scale-95 transition-transform"
          >
            <Plus size={18} /> Adicionar Item
          </button>
          <button
            onClick={() => canProceed && setStep("persons")}
            disabled={!canProceed}
            className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 ${
              canProceed ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Próximo <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Add/Edit Item Sheet */}
      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title={editId ? "Editar Item" : "Adicionar Item"}>
        <div className="px-4 pb-6 flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Nome do Item</label>
            <input
              className="mt-1 w-full h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)] transition-colors"
              placeholder="Ex: Pizza Portuguesa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Quantidade</label>
              <input
                type="number"
                className="mt-1 w-full h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)] transition-colors"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                min={1}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Valor Unit. (R$)</label>
              <div className="flex gap-1 mt-1">
                <input
                  className="flex-1 h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(formatPrice(e.target.value))}
                  inputMode="numeric"
                />
                <button
                  onClick={() => setCalcOpen(true)}
                  className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Calculator size={18} className="text-[var(--foreground)]" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={save}
            disabled={!name.trim() || !price}
            className="w-full h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform"
          >
            {editId ? "Salvar Alterações" : "Adicionar"}
          </button>
        </div>
      </BottomSheet>

      <CalcSheet open={calcOpen} onClose={() => setCalcOpen(false)} onInsert={(v) => setPrice(v)} />

      {/* Voice Sheet */}
      <BottomSheet open={voiceSheet} onClose={() => { stopListening(); setVoiceSheet(false); }} title="Ditar por Voz">
        <div className="px-4 pb-8 flex flex-col items-center gap-4">
          <p className="text-sm text-[var(--muted)] text-center">
            Fale os itens naturalmente.<br />
            <span className="font-semibold">Ex: "duas pizzas trinta reais cada, três cervejas oito reais"</span>
          </p>
          <button
            onClick={listening ? stopListening : startListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              listening ? "bg-red-500 shadow-lg shadow-red-500/40" : "bg-brand shadow-lg shadow-brand/40"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-60 animate-pulse-ring" />
            )}
            {listening ? <MicOff size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
          </button>
          <p className="text-xs text-[var(--muted)]">{listening ? "Ouvindo... toque para parar" : "Toque para falar"}</p>
          {voiceText && (
            <div className="w-full bg-[var(--surface)] rounded-2xl p-4">
              <p className="text-sm text-[var(--foreground)]">{voiceText}</p>
            </div>
          )}
          {voiceText && !listening && (
            <button
              onClick={applyVoice}
              className="w-full h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base active:scale-95 transition-transform"
            >
              Confirmar e Adicionar
            </button>
          )}
        </div>
      </BottomSheet>

      {/* OCR Sheet */}
      <BottomSheet open={ocrSheet} onClose={() => setOcrSheet(false)} title="Foto da Conta">
        <div className="px-4 pb-8 flex flex-col gap-4">
          <div
            onClick={() => !ocrLoading && fileRef.current?.click()}
            className={`w-full h-36 rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 transition-transform cursor-pointer ${ocrLoading ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}`}
          >
            {ocrLoading ? (
              <>
                <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-[var(--muted)]">Lendo a conta...</p>
              </>
            ) : (
              <>
                <Camera size={32} className="text-orange-400" />
                <p className="text-sm font-bold text-[var(--muted)]">Tirar foto ou escolher imagem</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">
              Cole ou edite o texto da conta
            </label>
            <textarea
              className="mt-1 w-full h-40 px-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none"
              placeholder={"2x Heineken ........ 28,00\nPizza Portuguesa .... 72,00\nÁgua Mineral ........ 6,00"}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              disabled={ocrLoading}
            />
          </div>
          <button
            onClick={applyOcr}
            disabled={!ocrText.trim() || ocrLoading}
            className="w-full h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base disabled:opacity-40 active:scale-95 transition-transform"
          >
            Importar Itens
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
