"use client";

import { ShoppingBag } from "lucide-react";

import { selectItemCount, useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export function CartTrigger() {
  const open = useCartStore((state) => state.open);
  const storedCount = useCartStore(selectItemCount);
  // El carrito vive en localStorage: hasta hidratar mostramos 0 para que coincida con el HTML del servidor.
  const count = useHydrated() ? storedCount : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={
        count > 0
          ? `Carrito, ${count} ${count === 1 ? "producto" : "productos"}`
          : "Carrito"
      }
      className="relative flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-1 flex h-3.5 min-w-3.5 items-center justify-center bg-gold px-0.5 text-[9px] leading-none font-semibold text-ink tabular-nums"
        >
          {count}
        </span>
      )}
    </button>
  );
}
