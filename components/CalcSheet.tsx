"use client";
import { useState } from "react";
import BottomSheet from "./BottomSheet";
import { Delete } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (value: string) => void;
};

export default function CalcSheet({ open, onClose, onInsert }: Props) {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [op, setOp] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [fresh, setFresh] = useState(false);

  const push = (d: string) => {
    if (fresh) { setDisplay(d); setFresh(false); return; }
    if (display === "0" && d !== ",") setDisplay(d);
    else if (display.length < 10) setDisplay(display + d);
  };

  const setOperator = (o: string) => {
    const cur = parseFloat(display.replace(",", "."));
    setLeft(cur);
    setOp(o);
    setExpr(display + " " + o);
    setFresh(true);
  };

  const calc = () => {
    if (!op || left === null) return;
    const right = parseFloat(display.replace(",", "."));
    let res = 0;
    if (op === "+") res = left + right;
    if (op === "−") res = left - right;
    if (op === "×") res = left * right;
    if (op === "÷") res = right !== 0 ? left / right : 0;
    const formatted = res.toFixed(2).replace(".", ",");
    setDisplay(formatted);
    setExpr("");
    setOp(null);
    setLeft(null);
    setFresh(true);
  };

  const clear = () => { setDisplay("0"); setExpr(""); setOp(null); setLeft(null); setFresh(false); };
  const backspace = () => {
    if (display.length <= 1) setDisplay("0");
    else setDisplay(display.slice(0, -1));
  };
  const comma = () => { if (!display.includes(",")) setDisplay(display + ","); };
  const confirm = () => { onInsert(display); onClose(); clear(); };

  const Btn = ({
    label, onClick, span = 1, variant = "default",
  }: { label: React.ReactNode; onClick: () => void; span?: number; variant?: "default" | "op" | "eq" | "clear" }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-2xl text-lg font-bold active:scale-95 transition-transform flex items-center justify-center
        ${span === 2 ? "col-span-2" : ""}
        ${variant === "default" ? "bg-[var(--surface)] text-[var(--foreground)]" : ""}
        ${variant === "op" ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]" : ""}
        ${variant === "eq" ? "bg-[var(--accent)] text-white" : ""}
        ${variant === "clear" ? "bg-red-50 text-red-500 dark:bg-red-950/30" : ""}
      `}
    >
      {label}
    </button>
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Calculadora">
      <div className="px-4 pb-6">
        <div className="bg-[var(--surface)] rounded-2xl p-4 mb-4 min-h-[72px] flex flex-col items-end justify-end">
          {expr && <p className="text-sm text-[var(--muted)] mb-1">{expr}</p>}
          <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{display}</p>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Btn label="C" onClick={clear} span={2} variant="clear" />
          <Btn label={<Delete size={18} />} onClick={backspace} />
          <Btn label="÷" onClick={() => setOperator("÷")} variant="op" />
          <Btn label="7" onClick={() => push("7")} />
          <Btn label="8" onClick={() => push("8")} />
          <Btn label="9" onClick={() => push("9")} />
          <Btn label="×" onClick={() => setOperator("×")} variant="op" />
          <Btn label="4" onClick={() => push("4")} />
          <Btn label="5" onClick={() => push("5")} />
          <Btn label="6" onClick={() => push("6")} />
          <Btn label="−" onClick={() => setOperator("−")} variant="op" />
          <Btn label="1" onClick={() => push("1")} />
          <Btn label="2" onClick={() => push("2")} />
          <Btn label="3" onClick={() => push("3")} />
          <Btn label="+" onClick={() => setOperator("+")} variant="op" />
          <Btn label="0" onClick={() => push("0")} span={2} />
          <Btn label="," onClick={comma} />
          <Btn label="=" onClick={calc} variant="op" />
        </div>
        <button
          onClick={confirm}
          className="w-full h-14 rounded-2xl bg-[var(--accent)] text-white font-bold text-base active:scale-95 transition-transform"
        >
          Usar R$ {display}
        </button>
      </div>
    </BottomSheet>
  );
}
