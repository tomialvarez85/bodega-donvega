import Image from "next/image";
import Link from "next/link";

import { ghostButton } from "@/components/home/buttons";
import { WineAddButton } from "@/components/home/wine-add-button";
import { ProductPrice } from "@/components/promotions/product-price";
import { formatInteger } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import { topAward } from "@/lib/awards";
import type { Product } from "@/lib/schema";

// Etiqueta sobre la botella: "Nuevo lanzamiento" tiene prioridad; si no, el mejor premio.
function badgeFor(product: Pick<Product, "isNewRelease" | "awards">) {
  if (product.isNewRelease) {
    return { text: "Nuevo lanzamiento", className: "bg-wine text-cream" };
  }
  const top = topAward(product.awards);
  if (!top) return null;
  return {
    text: `${top.award ?? "Puntaje"} · ${top.points} pts`,
    className: "bg-gold text-ink",
  };
}

function WineCard({ product }: { product: Product }) {
  const badge = badgeFor(product);
  const details = [
    product.vintage,
    product.altitudeMasl != null
      ? `${formatInteger(product.altitudeMasl)} msnm`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  // La bajada comercial puede estar vacía: usamos la nariz de la cata.
  const blurb = product.description || product.tastingNose;

  return (
    <article className="group relative flex flex-col border border-hairline bg-ink transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative h-[300px] border-b border-hairline bg-white/[0.03]">
        {badge && (
          <div
            className={`absolute top-4 left-0 z-10 px-2.5 py-[5px] text-[10px] font-semibold tracking-[0.08em] uppercase ${badge.className}`}
          >
            {badge.text}
          </div>
        )}
        <Image
          src={product.imageUrl}
          alt={`Botella de ${product.name}`}
          fill
          sizes="(min-width: 1200px) 378px, (min-width: 640px) 33vw, 100vw"
          className="object-contain object-bottom px-6 pt-10 pb-6"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-6 pt-6 pb-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[22px] leading-tight text-cream">
            <Link
              href={`/productos/${product.slug}`}
              className="after:absolute after:inset-0 focus-visible:after:outline-solid focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-wine"
            >
              {product.name}
            </Link>
          </h3>
          <ProductPrice product={product} className="shrink-0 items-end text-right" />
        </div>

        {details && (
          <p className="text-[11px] font-medium tracking-[0.06em] text-sand uppercase">
            {details}
          </p>
        )}

        <div className="my-2 h-px bg-hairline" />

        {blurb && (
          <p className="line-clamp-4 flex-1 text-sm leading-[1.65] text-sand">
            {blurb}
          </p>
        )}

        {/* El carrito trabaja con el precio efectivo (oferta incluida). */}
        <WineAddButton
          product={{ ...product, price: String(effectivePrice(product)) }}
        />
      </div>
    </article>
  );
}

export function FeaturedWines({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section
      id="catalogo"
      aria-labelledby="destacados-title"
      className="scroll-mt-20 border-t border-hairline"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(64px,8vw,104px)] sm:px-8">
        <div className="mb-14 flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <div className="h-px w-7 bg-gold" />
            <p className="text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
              Selección de bodega
            </p>
          </div>
          <h2
            id="destacados-title"
            className="max-w-[480px] font-display text-[clamp(28px,4vw,44px)] leading-[1.15] text-cream"
          >
            Nuestros vinos destacados
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-px border border-hairline">
          {products.map((product) => (
            <WineCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/catalogo" className={ghostButton}>
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
