"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ghostButton } from "@/components/home/buttons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  selectTotal,
  useCartStore,
  type CartItem,
} from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

// Mismo lenguaje que la ficha de producto: hairlines, Cormorant para nombres y precios,
// Work Sans en mayúsculas chicas para etiquetas, CTA bordó.
const stepClass =
  "flex h-full w-10 items-center justify-center text-cream transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:text-sand/40";

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const close = useCartStore((state) => state.close);
  const atMax = item.quantity >= item.stock;

  return (
    <li className="flex gap-4 border-b border-hairline py-6">
      <Link
        href={`/productos/${item.slug}`}
        onClick={close}
        aria-hidden
        tabIndex={-1}
        className="relative block h-[104px] w-[72px] shrink-0 border border-hairline bg-white/[0.03]"
      >
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="72px"
          className="object-contain p-1.5"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[22px] leading-[1.1] font-normal text-cream">
            <Link
              href={`/productos/${item.slug}`}
              onClick={close}
              className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {item.name}
            </Link>
          </h3>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={`Quitar ${item.name} del carrito`}
            className="-my-3 shrink-0 py-3 text-[10px] tracking-[0.16em] text-sand uppercase underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Quitar
          </button>
        </div>

        <p className="mt-1.5 text-xs tracking-[0.06em] text-stone tabular-nums">
          {formatPrice(item.price)} c/u
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <div
              role="group"
              aria-label={`Cantidad de ${item.name}`}
              className="flex h-10 items-stretch border border-sand/50"
            >
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={item.quantity <= 1}
                onClick={() => setQuantity(item.id, item.quantity - 1)}
                className={stepClass}
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <span
                aria-live="polite"
                className="flex w-10 items-center justify-center border-x border-hairline-mid font-display text-lg font-semibold text-cream tabular-nums"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={atMax}
                onClick={() => setQuantity(item.id, item.quantity + 1)}
                className={stepClass}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            {atMax && (
              <p className="mt-1.5 text-[11px] text-stone">
                Máximo disponible ({item.stock})
              </p>
            )}
          </div>

          <p className="font-display text-xl font-light text-cream tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function CartSheet() {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const notice = useCartStore((state) => state.notice);
  const total = useCartStore(selectTotal);
  const open = useCartStore((state) => state.open);
  const close = useCartStore((state) => state.close);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => (nextOpen ? open() : close())}
    >
      <SheetContent
        showCloseButton={false}
        className="gap-0 border-hairline-mid bg-ink p-0 shadow-none data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-hairline-mid px-6 py-5">
          <div>
            <SheetTitle className="font-display text-3xl leading-none font-light text-cream">
              Tu carrito
            </SheetTitle>
            <SheetDescription className="sr-only">
              Productos que agregaste para comprar.
            </SheetDescription>
          </div>
          <SheetClose
            aria-label="Cerrar carrito"
            className="flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </SheetClose>
        </SheetHeader>

        {notice && (
          <p
            role="status"
            className="border-b border-hairline-mid border-l-2 border-l-gold bg-white/[0.04] px-6 py-3 text-sm leading-snug text-cream"
          >
            {notice}
          </p>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="h-px w-16 bg-gold" />
            <p className={label}>Tu carrito</p>
            <p className="font-display text-3xl leading-tight font-light text-cream">
              Todavía está vacío
            </p>
            <p className="max-w-xs text-sm leading-[1.7] text-sand">
              Recorré el catálogo y elegí el vino que mejor te acompañe.
            </p>
            <Link href="/catalogo" onClick={close} className={ghostButton}>
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </ul>

            <SheetFooter className="gap-5 border-t border-hairline-mid px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className={label}>Total</span>
                <span className="font-display text-4xl leading-none font-light text-cream tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-[52px] w-full items-center justify-center bg-wine text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] active:scale-[0.99]"
              >
                Finalizar compra
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
