import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultBillName } from "./utils";

export type BillItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string;
};

export type Person = {
  id: string;
  name: string;
  pixKey?: string;
  color: string;
};

// Novo modelo: quantidade por pessoa por item
// { [itemId]: { [personId]: number } }
export type Attribution = {
  [itemId: string]: { [personId: string]: number };
};

export type Fee = {
  id: string;
  label: string;
  type: "percent" | "fixed" | "per-person";
  value: number;
  personIds?: string[];
};

export type Discount = {
  id: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  personIds?: string[];
};

export type BillMode = "restaurant" | "churrasco" | "party";

export type Bill = {
  id: string;
  name: string;
  mode: BillMode;
  items: BillItem[];
  persons: Person[];
  attribution: Attribution;
  fees: Fee[];
  discounts: Discount[];
  createdAt: number;
  paidPersonIds: string[];
};

export type BillResult = {
  personId: string;
  name: string;
  color: string;
  items: { name: string; amount: number }[];
  subtotal: number;
  fees: number;
  discounts: number;
  total: number;
};

type AppState = {
  bill: Bill;
  history: Bill[];
  darkMode: boolean;
  step: "home" | "items" | "persons" | "attribution" | "fees" | "result";
  setBill: (b: Partial<Bill>) => void;
  setStep: (s: AppState["step"]) => void;
  addItem: (item: BillItem) => void;
  updateItem: (id: string, item: Partial<BillItem>) => void;
  removeItem: (id: string) => void;
  addPerson: (p: Person) => void;
  updatePerson: (id: string, p: Partial<Person>) => void;
  removePerson: (id: string) => void;
  // Define quantidade de um item para uma pessoa
  setPersonQty: (itemId: string, personId: string, qty: number) => void;
  // Divide igualmente pelo valor (não pela quantidade) entre todas as pessoas
  splitEvenly: (itemId: string) => void;
  addFee: (f: Fee) => void;
  removeFee: (id: string) => void;
  togglePaid: (personId: string) => void;
  addDiscount: (d: Discount) => void;
  removeDiscount: (id: string) => void;
  saveBill: () => void;
  loadBill: (id: string) => void;
  resetBill: () => void;
  toggleDark: () => void;
  computeResults: () => BillResult[];
};

// Paleta neutra — tons distintos mas não gritantes
const COLORS = [
  "#3ECF8E","#6366F1","#F59E0B","#EC4899","#14B8A6","#8B5CF6",
  "#0EA5E9","#EF4444","#84CC16","#F97316","#06B6D4","#A855F7",
];

const newBill = (): Bill => ({
  id: crypto.randomUUID(),
  name: defaultBillName(),
  mode: "restaurant",
  items: [],
  persons: [],
  attribution: {},
  fees: [{ id: crypto.randomUUID(), label: "Taxa de Serviço 10%", type: "percent", value: 10 }],
  discounts: [],
  createdAt: Date.now(),
  paidPersonIds: [],
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      bill: newBill(),
      history: [],
      darkMode: true,
      step: "home",

      setBill: (b) => set((s) => ({ bill: { ...s.bill, ...b } })),
      setStep: (step) => set({ step }),

      addItem: (item) =>
        set((s) => ({ bill: { ...s.bill, items: [...s.bill.items, item] } })),
      updateItem: (id, item) =>
        set((s) => ({
          bill: {
            ...s.bill,
            items: s.bill.items.map((i) => (i.id === id ? { ...i, ...item } : i)),
          },
        })),
      removeItem: (id) =>
        set((s) => {
          const att = { ...s.bill.attribution };
          delete att[id];
          return { bill: { ...s.bill, items: s.bill.items.filter((i) => i.id !== id), attribution: att } };
        }),

      addPerson: (p) =>
        set((s) => ({ bill: { ...s.bill, persons: [...s.bill.persons, p] } })),
      updatePerson: (id, p) =>
        set((s) => ({
          bill: {
            ...s.bill,
            persons: s.bill.persons.map((x) => (x.id === id ? { ...x, ...p } : x)),
          },
        })),
      removePerson: (id) =>
        set((s) => {
          const att: Attribution = {};
          for (const [itemId, qtys] of Object.entries(s.bill.attribution)) {
            const { [id]: _removed, ...rest } = qtys;
            att[itemId] = rest;
          }
          return { bill: { ...s.bill, persons: s.bill.persons.filter((x) => x.id !== id), attribution: att } };
        }),

      setPersonQty: (itemId, personId, qty) =>
        set((s) => {
          const itemAtt = { ...(s.bill.attribution[itemId] ?? {}) };
          if (qty <= 0) delete itemAtt[personId];
          else itemAtt[personId] = qty;
          return { bill: { ...s.bill, attribution: { ...s.bill.attribution, [itemId]: itemAtt } } };
        }),

      // Divide igualmente pelo valor: marca 1 unidade para cada pessoa (proporção igual)
      splitEvenly: (itemId) =>
        set((s) => {
          const persons = s.bill.persons;
          const itemAtt: { [personId: string]: number } = {};
          persons.forEach((p) => { itemAtt[p.id] = 1; });
          return { bill: { ...s.bill, attribution: { ...s.bill.attribution, [itemId]: itemAtt } } };
        }),

      addFee: (f) =>
        set((s) => ({ bill: { ...s.bill, fees: [...s.bill.fees, f] } })),
      removeFee: (id) =>
        set((s) => ({ bill: { ...s.bill, fees: s.bill.fees.filter((f) => f.id !== id) } })),

      togglePaid: (personId) =>
        set((s) => {
          const paid = s.bill.paidPersonIds ?? [];
          const paidPersonIds = paid.includes(personId)
            ? paid.filter((id) => id !== personId)
            : [...paid, personId];
          const bill = { ...s.bill, paidPersonIds };
          const history = s.history.some((h) => h.id === bill.id)
            ? s.history.map((h) => (h.id === bill.id ? bill : h))
            : s.history;
          return { bill, history };
        }),

      addDiscount: (d) =>
        set((s) => ({ bill: { ...s.bill, discounts: [...s.bill.discounts, d] } })),
      removeDiscount: (id) =>
        set((s) => ({ bill: { ...s.bill, discounts: s.bill.discounts.filter((d) => d.id !== id) } })),

      saveBill: () =>
        set((s) => {
          const exists = s.history.find((h) => h.id === s.bill.id);
          const history = exists
            ? s.history.map((h) => (h.id === s.bill.id ? s.bill : h))
            : [s.bill, ...s.history].slice(0, 20);
          return { history };
        }),

      loadBill: (id) =>
        set((s) => {
          const bill = s.history.find((h) => h.id === id);
          return bill ? { bill, step: "items" } : {};
        }),

      resetBill: () => set({ bill: newBill(), step: "home" }),
      toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),

      computeResults: () => {
        const { bill } = get();
        const { items, persons, attribution, fees, discounts } = bill;
        if (!persons.length) return [];

        const totalBill = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

        const results: BillResult[] = persons.map((p) => ({
          personId: p.id, name: p.name, color: p.color,
          items: [], subtotal: 0, fees: 0, discounts: 0, total: 0,
        }));

        // Distribui itens proporcionalmente às quantidades atribuídas
        for (const item of items) {
          const qtys = attribution[item.id] ?? {};
          const totalAssigned = Object.values(qtys).reduce((s, q) => s + q, 0);
          if (totalAssigned === 0) continue;

          const totalPrice = item.quantity * item.unitPrice;

          for (const [pid, qty] of Object.entries(qtys)) {
            if (qty <= 0) continue;
            const r = results.find((r) => r.personId === pid);
            if (!r) continue;
            const share = (qty / totalAssigned) * totalPrice;
            r.items.push({ name: item.name, amount: share });
            r.subtotal += share;
          }
        }

        // Taxas
        for (const fee of fees) {
          const targets = fee.personIds?.length
            ? results.filter((r) => fee.personIds!.includes(r.personId))
            : results;

          if (fee.type === "percent") {
            const base = fee.personIds?.length
              ? results.filter((r) => fee.personIds!.includes(r.personId)).reduce((s, r) => s + r.subtotal, 0)
              : totalBill;
            for (const r of targets) {
              const proportion = base > 0 ? r.subtotal / base : 1 / targets.length;
              r.fees += base * (fee.value / 100) * proportion;
            }
          } else if (fee.type === "fixed") {
            const share = fee.value / targets.length;
            for (const r of targets) r.fees += share;
          } else if (fee.type === "per-person") {
            for (const r of targets) r.fees += fee.value;
          }
        }

        // Descontos
        for (const disc of discounts) {
          const targets = disc.personIds?.length
            ? results.filter((r) => disc.personIds!.includes(r.personId))
            : results;
          if (disc.type === "percent") {
            for (const r of targets) r.discounts += r.subtotal * (disc.value / 100);
          } else {
            const share = disc.value / targets.length;
            for (const r of targets) r.discounts += share;
          }
        }

        for (const r of results) {
          r.total = Math.max(0, r.subtotal + r.fees - r.discounts);
        }

        return results;
      },
    }),
    { name: "racha-ai-v2", partialize: (s) => ({ history: s.history, darkMode: s.darkMode }) }
  )
);

export const PERSON_COLORS = COLORS;
export const nextColor = (persons: Person[]) => COLORS[persons.length % COLORS.length];
