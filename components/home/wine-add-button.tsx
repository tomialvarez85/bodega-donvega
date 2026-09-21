"use client";

import { useEffect, useRef, useState } from "react";

import { ghostButton, solidButton } from "@/components/home/buttons";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/schema";
import { cn } from "@/lib/utils";

type WineAddButtonProps = {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "imageUrl" | "stock">;
};

// "Agregar al carrito" de las tarjetas del Home. Igual que en el resto del sitio, al
// agregar se abre el carrito lateral; además el botón confirma por 1,8 s como en el diseño.
export function WineAddButton({ product }: WineAddButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const outOfStock = product.stock <= 0;
  // El precio queda en 0 hasta cargar el real: no se vende hasta entonces.
  const noPrice = Number(product.price) <= 0;
  const disabled = outOfStock || noPrice;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Agregar ${product.name} al carrito`}
      onClick={() => {
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          stock: product.stock,
        });
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1800);
      }}
      className={cn(
        added ? ghostButton : solidButton,
        "relative z-10 mt-5 w-full cursor-pointer text-center disabled:pointer-events-none disabled:border-hairline-mid disabled:bg-transparent disabled:text-sand",
      )}
    >
      {outOfStock
        ? "Sin stock"
        : noPrice
          ? "Próximamente"
          : added
            ? "Agregado al carrito"
            : "Agregar al carrito"}
    </button>
  );
}
