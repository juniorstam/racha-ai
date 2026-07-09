"use client";
import { useState } from "react";
import Image from "next/image";
import { Camera, Mic, Keyboard, FolderOpen, Share2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { shareText } from "@/lib/utils";
import HistorySheet from "./HistorySheet";

export default function HomeScreen() {
  const { setStep, resetBill, darkMode } = useStore();
  const [histOpen, setHistOpen] = useState(false);

  const shareApp = () => {
    shareText("🍻 Divida a conta com Racha Aí — grátis e sem cadastro: https://rachaai.stamcom.com.br");
  };

  const start = (entryMethod?: string) => {
    resetBill();
    if (entryMethod === "voice") {
      setStep("items");
      setTimeout(() => window.dispatchEvent(new CustomEvent("racha-start-voice")), 300);
    } else if (entryMethod === "ocr") {
      setStep("items");
      setTimeout(() => window.dispatchEvent(new CustomEvent("racha-start-ocr")), 300);
    } else {
      setStep("items");
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ background: "var(--accent)", height: "100dvh" }}>

      {/* Círculos decorativos */}
      <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ background: "white", transform: "translate(25%, -25%)" }} />
      <div className="absolute top-[38%] left-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: "white", transform: "translate(-25%, 0)" }} />

      {/* Compartilhar o app */}
      <button
        onClick={shareApp}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Share2 size={18} className="text-white" />
      </button>

      {/* Logo + slogan */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-8 pb-12 text-center">
        <Image
          src={darkMode ? "/logo-escuro.png" : "/logo-claro.png"}
          alt="Racha Aí"
          width={180}
          height={72}
          className="object-contain brightness-0 invert mb-1"
          priority
        />
        <p className="text-white text-xl font-bold leading-snug">
          Divida a conta sem<br />dividir a amizade.
        </p>
      </div>

      {/* Botões brancos — grade 2×2 */}
      <div className="flex-[1.6] px-5 pb-6 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4">
          <Btn icon={<Keyboard size={40} />}    title="Digitar"  sub="Manualmente" onClick={() => start()} />
          <Btn icon={<Mic size={40} />}         title="Ditar"    sub="por Voz"     onClick={() => start("voice")} />
          <Btn icon={<Camera size={40} />}      title="Foto"     sub="da Conta"    onClick={() => start("ocr")} />
          <Btn icon={<FolderOpen size={40} />}  title="Abrir"    sub="Conta Salva" onClick={() => setHistOpen(true)} />
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Racha Aí · Grátis · Sem cadastro
        </p>
      </div>

      <HistorySheet open={histOpen} onClose={() => setHistOpen(false)} />
    </div>
  );
}

function Btn({ icon, title, sub, onClick }: {
  icon: React.ReactNode; title: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl active:scale-95 transition-all shadow-lg"
      style={{ minHeight: 160 }}
    >
      <div style={{ color: "var(--accent)" }}>{icon}</div>
      <div className="text-center">
        <p className="font-bold text-gray-900 text-lg leading-tight">{title}</p>
        <p className="text-gray-500 text-sm mt-0.5">{sub}</p>
      </div>
    </button>
  );
}
