"use client";
import { useState } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import BottomSheet from "./BottomSheet";
import { Plus, Minus, RotateCcw, Beer } from "lucide-react";

const BEER_BRANDS = [
  { name: "Heineken", image: "/beers/cerveja_heineken.webp" },
  { name: "Amstel", image: "/beers/cerveja_amstel.webp" },
  { name: "Eisenbahn", image: "/beers/cerveja_eisenbahn.webp" },
  { name: "Baden Baden", image: "/beers/cerveja_baden_baden.webp" },
  { name: "Blue Moon", image: "/beers/cerveja_blue_moon.webp" },
  { name: "Kaiser", image: "/beers/cerveja_kaiser.webp" },
  { name: "Lagunitas", image: "/beers/cerveja_lagunitas.webp" },
  { name: "Sol", image: "/beers/cerveja_sol.webp" },
  { name: "Outra marca", image: "/beers/outra.webp" },
];

const brandImage = (name: string) => BEER_BRANDS.find((b) => b.name === name)?.image;

type Props = { open: boolean; onClose: () => void };

export default function BeerCounterSheet({ open, onClose }: Props) {
  const { beerCounts, addBeerBrand, incBeer, decBeer, resetBeerCounter } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const brands = Object.keys(beerCounts);
  const availableBrands = BEER_BRANDS.filter((b) => !brands.includes(b.name));

  const pick = (brand: string) => {
    addBeerBrand(brand);
    setPickerOpen(false);
  };

  const confirmReset = () => {
    resetBeerCounter();
    setConfirmOpen(false);
  };

  return (
    <>
    <BottomSheet open={open} onClose={() => { setPickerOpen(false); onClose(); }}>
      <div className="px-4 pb-8 flex flex-col gap-2">
        <div className="text-center px-4 pt-1 pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Contador de Cervejas</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Só um contadorzinho manual — não mexe em nada da conta, é só pra conferir se bate com o que o bar cobrar no final. 🍻
          </p>
        </div>

        {brands.length === 0 && !pickerOpen && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <Beer size={40} className="text-[var(--muted)] mb-4" />
            <p className="font-bold text-[var(--foreground)]">Nenhuma cerveja adicionada</p>
            <p className="text-sm text-[var(--muted)] mt-1">Toque em "Adicionar cerveja" para começar a contar</p>
          </div>
        )}

        {brands.map((brand) => (
          <div
            key={brand}
            className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
          >
            {brandImage(brand) ? (
              <div className="w-10 h-10 rounded-full bg-white shrink-0 overflow-hidden relative">
                <Image src={brandImage(brand)!} alt={brand} fill className="object-contain p-1" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] shrink-0 flex items-center justify-center">
                <Beer size={18} className="text-[var(--muted)]" />
              </div>
            )}
            <p className="flex-1 font-bold text-[var(--foreground)] truncate">{brand}</p>
            <button
              onClick={() => decBeer(brand)}
              className="w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus size={16} className="text-[var(--foreground)]" />
            </button>
            <span className="w-8 text-center font-bold text-[var(--foreground)] tabular-nums">
              {beerCounts[brand]}
            </span>
            <button
              onClick={() => incBeer(brand)}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>
        ))}

        {pickerOpen ? (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm font-bold text-[var(--muted)] px-1">Escolha a marca</p>
            <div className="grid grid-cols-2 gap-2">
              {availableBrands.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => pick(brand.name)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-bold text-[var(--foreground)] text-sm active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-full bg-white shrink-0 overflow-hidden relative">
                    <Image src={brand.image} alt={brand.name} fill className="object-contain p-1" />
                  </div>
                  <span className="truncate">{brand.name}</span>
                </button>
              ))}
            </div>
            {availableBrands.length === 0 && (
              <p className="text-sm text-[var(--muted)] text-center py-4">Todas as marcas já foram adicionadas</p>
            )}
            <button
              onClick={() => setPickerOpen(false)}
              className="mt-1 p-3 rounded-xl text-sm font-bold text-[var(--muted)]"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-[var(--border)] font-bold text-[var(--foreground)] active:scale-[0.98] transition-transform"
          >
            <Plus size={18} />
            Adicionar cerveja
          </button>
        )}

        {brands.length > 0 && !pickerOpen && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-4 flex items-center justify-center gap-2 p-3 rounded-2xl text-sm font-bold text-red-500 active:scale-[0.98] transition-transform"
          >
            <RotateCcw size={16} />
            Reiniciar contador
          </button>
        )}
      </div>
    </BottomSheet>

    {confirmOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmOpen(false)} />
        <div className="relative w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 text-center shadow-2xl">
          <div className="text-4xl mb-3">🍻</div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">Reiniciar contador?</h3>
          <p className="text-sm text-[var(--muted)] mt-2">
            Isso zera todas as cervejas contadas. Combina com o povo antes de fazer isso na mesa errada.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 p-3 rounded-2xl font-bold text-sm text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button
              onClick={confirmReset}
              className="flex-1 p-3 rounded-2xl font-bold text-sm text-white bg-red-500 active:scale-95 transition-transform"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
