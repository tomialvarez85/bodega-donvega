"use client";

import { useState } from "react";

import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/schema";

const stepClass =
  "flex h-full w-11 items-center justify-center text-lg text-cream transition-colors hover:bg-white/5 disabled:pointer-events-none disabled:text-sand/40";

type PurchasePanelProps = {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "price" | "imageUrl" | "stock"
  >;
  /** Si viene, la compra queda bloqueada con este texto en el botón (ej. precio sin cargar). */
  unavailableLabel?: string;
};

// Selector de cantidad + "Agregar al carrito". El máximo es el stock disponible.
export function PurchasePanel({
  product,
  unavailableLabel,
}: PurchasePanelProps) {
  const { stock } = product;
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = stock <= 0;
  const blocked = outOfStock || Boolean(unavailableLabel);
  // String para permitir el campo vacío mientras se escribe; se normaliza al salir.
  const [value, setValue] = useState("1");
  const quantity = Math.min(Math.max(parseInt(value, 10) || 1, 1), stock);

  function change(raw: string) {
    if (raw === "") return setValue("");
    const number = parseInt(raw, 10);
    if (Number.isNaN(number)) return;
    setValue(String(Math.min(Math.max(number, 1), stock)));
  }

  return (
    <div className="flex items-stretch gap-3">
      <div
        role="group"
        aria-label="Cantidad"
        className="flex h-[52px] shrink-0 items-stretch border border-sand/50"
      >
        <button
          type="button"
          aria-label="Disminuir cantidad"
          disabled={blocked || quantity <= 1}
          onClick={() => setValue(String(quantity - 1))}
          className={stepClass}
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label="Cantidad"
          min={1}
          max={stock}
          disabled={blocked}
          value={blocked ? 0 : value}
          onChange={(event) => change(event.target.value)}
          onBlur={() => setValue(String(quantity))}
          className="w-11 [appearance:textfield] border-x border-hairline-mid bg-transparent text-center font-display text-xl font-semibold text-cream tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold disabled:text-sand/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Aumentar cantidad"
          disabled={blocked || quantity >= stock}
          onClick={() => setValue(String(quantity + 1))}
          className={stepClass}
        >
          +
        </button>
      </div>

      {/* Conectado al carrito global: al agregar se abre el panel del carrito. */}
      <button
        type="button"
        disabled={blocked}
        aria-label={
          blocked
            ? undefined
            : `Agregar ${quantity} ${quantity === 1 ? "unidad" : "unidades"} de ${product.name} al carrito`
        }
        onClick={() =>
          addItem(
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              imageUrl: product.imageUrl,
              stock: product.stock,
            },
            quantity,
          )
        }
        className="h-[52px] flex-1 cursor-pointer bg-wine px-7 text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] active:scale-[0.99] disabled:cursor-not-allowed disabled:border disabled:border-hairline-mid disabled:bg-transparent disabled:text-sand disabled:hover:bg-transparent disabled:active:scale-100"
      >
        {outOfStock
          ? "Sin stock"
          : (unavailableLabel ?? "Agregar al carrito")}
      </button>
    </div>
  );
}
