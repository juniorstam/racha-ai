"use client";
import { useState, useRef } from "react";
import { Plus, Trash2, Mic, MicOff, ChevronRight, UserPlus, RotateCcw } from "lucide-react";
import { useStore, Person, PERSON_COLORS } from "@/lib/store";
import { uid } from "@/lib/utils";
import TopBar from "./TopBar";
import StepBar from "./StepBar";

// Separa nomes por vírgula, ponto-e-vírgula, " e ", " com "
// NÃO quebra em espaço simples — "Maria Clara" continua um nome só
function splitNames(text: string): string[] {
  return text
    .split(/,|;|\s+e\s+|\s+com\s+|\s+mais\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

export default function PersonsScreen() {
  const { bill, addPerson, updatePerson, removePerson, setStep } = useStore();
  const [newName, setNewName] = useState("");
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFromText = (text: string) => {
    const names = splitNames(text);
    if (!names.length) return;
    let colorIndex = bill.persons.length;
    names.forEach((name) => {
      if (!bill.persons.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
        addPerson({ id: uid(), name, color: PERSON_COLORS[colorIndex % PERSON_COLORS.length] });
        colorIndex++;
      }
    });
    setNewName("");
    inputRef.current?.focus();
  };

  const handleAdd = () => addFromText(newName);

  // Guarda o último transcript capturado (interim ou final)
  const transcriptRef = useRef("");

  const toggleVoice = () => {
    if (listening) {
      recogRef.current?.stop();
      // onend vai disparar e commitar o que foi capturado
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voz não suportada neste navegador."); return; }

    transcriptRef.current = "";

    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = false;
    r.interimResults = true; // captura resultados parciais para não perder nada

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      let best = "";
      for (let i = 0; i < e.results.length; i++) {
        best += e.results[i][0].transcript;
      }
      transcriptRef.current = best;
    };

    r.onend = () => {
      setListening(false);
      const captured = transcriptRef.current.trim();
      if (captured) addFromText(captured);
      transcriptRef.current = "";
    };

    r.onerror = () => {
      setListening(false);
      transcriptRef.current = "";
    };

    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const clearAll = () => {
    [...bill.persons].forEach((p) => removePerson(p.id));
  };

  const canProceed = bill.persons.length >= 2;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar
        title="Participantes"
        onBack={() => setStep("items")}
        right={
          bill.persons.length > 0 ? (
            <button
              onClick={clearAll}
              className="w-9 h-9 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center active:scale-95 transition-transform"
              title="Apagar todos"
            >
              <RotateCcw size={15} className="text-[var(--muted)]" />
            </button>
          ) : undefined
        }
      />
      <StepBar current={1} />

      <div className="flex-1 px-4 pt-3 max-w-lg mx-auto w-full">
        <p className="text-[var(--muted)] text-sm mb-4">
          Quem está participando? Separe vários nomes por vírgula.
        </p>

        {/* Campo + microfone + mais — igual tela de itens */}
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            className="flex-1 h-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold focus:outline-none focus:border-[var(--foreground)] transition-colors"
            placeholder="Ex: João, Maria, Pedro"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={toggleVoice}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-all ${
              listening ? "bg-red-500" : "bg-[var(--accent-light)]"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 rounded-2xl bg-red-400 opacity-50 animate-pulse-ring" />
            )}
            {listening
              ? <MicOff size={18} className="text-white" />
              : <Mic size={18} className="text-[var(--accent)]" />}
          </button>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {listening && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 mb-4 text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              🎤 Fale os nomes: "João, Maria e Carlos"
            </p>
          </div>
        )}

        {/* Lista de pessoas */}
        <div className="flex flex-col gap-2">
          {bill.persons.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              onRename={(name) => updatePerson(person.id, { name })}
              onRemove={() => removePerson(person.id)}
            />
          ))}
        </div>

        {bill.persons.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center animate-fade-in">
            <UserPlus size={48} className="text-[var(--muted)] mb-3" />
            <p className="font-bold text-[var(--foreground)]">Adicione ao menos 2 pessoas</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              Digite nomes separados por vírgula ou use o microfone
            </p>
          </div>
        )}

        {bill.persons.length === 1 && (
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            Adicione mais uma pessoa para continuar
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)] px-4 py-3 max-w-lg mx-auto w-full">
        <div className="flex gap-2">
          <button
            onClick={() => setStep("items")}
            className="h-12 px-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm text-[var(--foreground)] active:scale-95 transition-transform"
          >
            Voltar
          </button>
          <button
            onClick={() => canProceed && setStep("attribution")}
            disabled={!canProceed}
            className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 ${
              canProceed ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Próximo <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonRow({
  person, onRename, onRemove,
}: {
  person: Person;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(person.name);

  if (!editing && val !== person.name) setVal(person.name);

  const commit = () => {
    if (val.trim()) onRename(val.trim());
    else setVal(person.name);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-fade-in">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
        style={{ background: person.color }}
      >
        {person.name.charAt(0).toUpperCase()}
      </div>
      {editing ? (
        <input
          className="flex-1 h-9 px-3 rounded-xl bg-[var(--background)] border border-[var(--foreground)] text-[var(--foreground)] font-semibold text-sm focus:outline-none"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setVal(person.name); setEditing(false); }
          }}
          autoFocus
        />
      ) : (
        <button className="flex-1 text-left py-1" onClick={() => setEditing(true)}>
          <p className="font-bold text-[var(--foreground)] text-base">{person.name}</p>
          <p className="text-[10px] text-[var(--muted)]">Toque para renomear</p>
        </button>
      )}
      {/* Botão de remover sempre visível */}
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <Trash2 size={20} className="text-[var(--muted)]" />
      </button>
    </div>
  );
}
