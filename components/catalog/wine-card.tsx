import Image from "next/image";
import Link from "next/link";

import { topAward } from "@/lib/awards";
import { ProductPrice } from "@/components/promotions/product-price";
import type { Product } from "@/lib/schema";
import { cn } from "@/lib/utils";

const tag =
  "inline-block border-[0.5px] px-[7px] py-0.5 text-[9px] tracking-[0.14em] whitespace-nowrap uppercase";

// Medalla en línea fina: bronce para "Oro", plata para el resto.
function Medal({ award }: { award: string }) {
  const color = /oro/i.test(award) ? "#b08d57" : "#c0c0c0";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="0.5" />
      <circle cx="7" cy="7" r="3.5" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

// Ficha de vino del catálogo: hairlines, sin sombras. Toda la ficha lleva a la página del
// vino (enlace extendido en el nombre) y "Ver ficha" es solo la señal visual.
// Los bordes entre fichas los dibuja la grilla del catálogo; acá solo hover y contenido.
export function WineCard({ product }: { product: Product }) {
  const top = topAward(product.awards);
  const blurb = product.description || product.tastingNose;

  return (
    <article className="group relative flex h-full flex-col bg-ink">
      <div className="h-[1.5px] bg-transparent transition-colors duration-300 group-hover:bg-gold" />

      <div className="relative flex h-[300px] items-center justify-center border-b-[0.5px] border-hairline px-4 pt-8 pb-6">
        <span
          className={cn(
            "absolute top-3.5 left-4 text-[9px] tracking-[0.18em] uppercase",
            product.line === "ADN" ? "text-gold" : "text-sand",
          )}
        >
          Línea {product.line}
        </span>

        {product.isNewRelease && (
          <span className={cn(tag, "absolute top-3.5 right-3 border-cream/80 text-cream/80")}>
            Nuevo lanzamiento
          </span>
        )}

        <Image
          src={product.imageUrl}
          alt={`Botella de ${product.name}`}
          fill
          sizes="(min-width: 1440px) 380px, (min-width: 900px) 25vw, (min-width: 721px) 33vw, (min-width: 421px) 50vw, 100vw"
          className="object-contain px-4 pt-11 pb-6"
        />
      </div>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
        <p className="mb-2 text-[10px] tracking-[0.14em] text-sand uppercase">
          {product.varietal}
          {product.vintage ? ` · ${product.vintage}` : ""}
        </p>

        <h2 className="mb-2.5 font-display text-[clamp(18px,2.2vw,24px)] leading-[1.1] font-normal text-cream">
          <Link
            href={`/productos/${product.slug}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:outline-solid focus-visible:after:outline-1 focus-visible:after:-outline-offset-2 focus-visible:after:outline-gold"
          >
            {product.name}
          </Link>
        </h2>

        {top && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-display text-[15px] font-light tracking-[0.03em] text-gold">
              {top.points} pts
            </span>
            {top.award && (
              <span className="flex items-center gap-[5px]">
                <Medal award={top.award} />
                <span className={cn(tag, "border-gold text-gold")}>{top.award}</span>
              </span>
            )}
          </div>
        )}

        {blurb && (
          <p className="mb-4 line-clamp-3 text-xs leading-[1.65] text-sand">
            {blurb}
          </p>
        )}

        <p className="mt-auto mb-5 pt-1 text-[10px] tracking-[0.1em] text-stone uppercase">
          {product.origin}
        </p>

        <div className="flex items-end justify-between gap-3 border-t-[0.5px] border-hairline pt-3.5">
          <ProductPrice product={product} />
          <span
            aria-hidden
            className="border-[0.5px] border-hairline-mid px-3.5 py-[7px] text-[9px] tracking-[0.16em] text-sand uppercase transition-[color,background-color,border-color] duration-[250ms] group-hover:border-wine group-hover:bg-wine group-hover:text-cream motion-reduce:transition-none"
          >
            Ver ficha
          </span>
        </div>
      </div>
    </article>
  );
}
