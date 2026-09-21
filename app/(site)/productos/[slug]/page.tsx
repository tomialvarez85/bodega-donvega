import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WineCard } from "@/components/catalog/wine-card";
import { baskerville } from "@/components/product-fonts";
import {
  AwardsBand,
  GoldRule,
  TastingNotes,
  TechnicalSheet,
} from "@/components/product-detail-sections";
import { PurchasePanel } from "@/components/purchase-panel";
import { topAward } from "@/lib/awards";
import { ProductPrice } from "@/components/promotions/product-price";
import { formatDecimal } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

type Params = Promise<{ slug: string }>;

const LOW_STOCK_THRESHOLD = 5;

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Vino no encontrado" };

  // Bajada comercial si existe; si no, la nariz de la nota de cata.
  const blurb = product.description || product.tastingNose || "";
  const description = truncate(
    `${product.name}: ${product.varietal}${product.vintage ? ` ${product.vintage}` : ""}, línea ${product.line}, ${product.origin}. ${blurb}`,
    160,
  );
  const socialTitle = `${product.name} — Don Vega`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: socialTitle,
      description,
      type: "website",
      locale: "es_AR",
      siteName: "Don Vega",
      images: [{ url: product.imageUrl, alt: `Botella de ${product.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [product.imageUrl],
    },
  };
}

const crumbLink =
  "transition-colors hover:text-sand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
const gutter = "px-[clamp(20px,5vw,80px)]";

export default async function ProductoPage({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const outOfStock = product.stock <= 0;
  // El precio queda en 0 hasta que se cargue el real: no lo mostramos ni vendemos como "$ 0".
  const price = effectivePrice(product);
  const hasPrice = price > 0;
  const award = topAward(product.awards);

  // "Tinogasta, Catamarca" => ciudad y provincia para el subtítulo y la tira de datos.
  const [place, province = place] = product.origin
    .split(",")
    .map((part) => part.trim());

  const meta = [
    { key: "Varietal", value: product.varietal },
    { key: "Añada", value: product.vintage ? String(product.vintage) : null },
    { key: "Origen", value: province },
    {
      key: "Alcohol",
      value:
        product.alcoholPercentage != null
          ? `${formatDecimal(product.alcoholPercentage)}°`
          : null,
    },
  ].filter((item): item is { key: string; value: string } => Boolean(item.value));

  return (
    <div
      className={`${baskerville.variable} font-serif-body text-[15px] leading-[1.75]`}
    >
      <nav
        aria-label="Ruta de navegación"
        className={`py-4 text-[11px] tracking-[0.12em] text-stone uppercase ${gutter}`}
      >
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href="/" className={crumbLink}>
              Inicio
            </Link>
          </li>
          <li aria-hidden>·</li>
          <li>
            <Link href="/catalogo" className={crumbLink}>
              Catálogo
            </Link>
          </li>
          <li aria-hidden>·</li>
          <li aria-current="page" className="text-sand">
            {product.name}
            {product.vintage ? ` ${product.vintage}` : ""}
          </li>
        </ol>
      </nav>

      <div>
        <section
          aria-label="Detalle del producto"
          className={`mx-auto grid max-w-[1200px] items-start pb-20 md:grid-cols-2 ${gutter}`}
        >
          {/* Botella */}
          <div className="flex min-w-0 flex-col items-center py-8 pb-5 md:py-10 md:pr-10">
            <div className="relative w-full max-w-[400px]">
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 h-[560px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(176,141,87,0.16),transparent_70%)]"
              />
              <div className="relative z-10 mx-auto aspect-[2/3] w-full max-w-[360px] motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both">
                <Image
                  src={product.imageUrl}
                  alt={`Botella de ${product.name}`}
                  fill
                  priority
                  sizes="360px"
                  className="object-contain"
                />
              </div>

              {award && (
                <div
                  aria-label={`Premio: ${award.points} puntos${award.award ? `, ${award.award}` : ""}`}
                  className="absolute right-4 bottom-2 z-20 max-w-[190px] border border-gold bg-card px-[18px] py-4 text-center shadow-[2px_3px_0_var(--color-gold)] md:right-0 md:bottom-5"
                >
                  <div className="font-display text-4xl leading-none font-bold text-cream">
                    {award.points}
                    <sup className="mt-1 align-top text-base">pts</sup>
                  </div>
                  <div className="mt-1 text-[9px] tracking-[0.2em] text-gold uppercase">
                    {award.award ?? "Puntaje"}
                  </div>
                  <div className="mt-0.5 font-display text-[13px] leading-tight text-sand italic">
                    {award.contest}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compra */}
          <div className="min-w-0 border-hairline-mid pt-10 max-md:border-t md:border-l md:pt-16 md:pb-10 md:pl-12">
            {product.isNewRelease && (
              <p className="mb-4 inline-block border border-cream/70 px-2.5 py-1 text-[10px] tracking-[0.2em] text-cream uppercase">
                Nuevo lanzamiento
              </p>
            )}
            <p className="mb-3 text-[10px] tracking-[0.26em] text-gold uppercase">
              Línea {product.line} · {product.varietal}
              {product.vintage ? ` · Añada ${product.vintage}` : ""}
            </p>
            <h1 className="mb-1.5 font-display text-[clamp(38px,5vw,58px)] leading-[1.02] font-bold tracking-[-0.01em] text-cream">
              {product.name}
            </h1>
            <p className="mb-7 font-display text-[22px] font-normal text-gold italic">
              Don Vega — {place}
            </p>

            {meta.length > 0 && (
              <ul className="mb-9 flex overflow-x-auto border-y border-hairline-mid">
                {meta.map((item) => (
                  <li
                    key={item.key}
                    className="mr-5 min-w-[90px] shrink-0 border-r border-hairline-mid py-3.5 pr-5 last:mr-0 last:border-r-0"
                  >
                    <span className="mb-[3px] block text-[9px] tracking-[0.22em] text-stone uppercase">
                      {item.key}
                    </span>
                    <span className="font-display text-lg font-semibold text-cream">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {product.description && (
              <p className="mb-9 max-w-[400px] text-sm leading-[1.8] whitespace-pre-line text-sand italic">
                {product.description}
              </p>
            )}

            <div className="mb-7 flex items-end gap-3">
              {hasPrice ? (
                <>
                  <ProductPrice product={product} variant="hero" />
                  <span className="text-xs tracking-[0.1em] text-stone uppercase">
                    / botella 750 ml
                  </span>
                </>
              ) : (
                <span className="font-display text-3xl text-sand italic">
                  Precio a confirmar
                </span>
              )}
            </div>

            <div className="mb-4">
              {/* El carrito cobra el precio efectivo (oferta incluida). */}
              <PurchasePanel
                product={{ ...product, price: String(price) }}
                unavailableLabel={hasPrice ? undefined : "Próximamente"}
              />
            </div>

            <p
              aria-live="polite"
              className="text-xs tracking-[0.06em] text-stone"
            >
              <strong className="font-normal text-sand">
                {outOfStock
                  ? "Sin stock"
                  : product.stock <= LOW_STOCK_THRESHOLD
                    ? `Últimas ${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}`
                    : "Stock disponible"}
              </strong>
            </p>
          </div>
        </section>

        <GoldRule />
        <TastingNotes product={product} />
        <GoldRule />
        <TechnicalSheet product={product} />
        <AwardsBand
          awards={product.awards}
          wineName={product.name}
          vintage={product.vintage}
        />
      </div>

      {related.length > 0 && (
        <section
          aria-labelledby="relacionados"
          className={`mx-auto max-w-[1200px] py-[72px] font-sans ${gutter}`}
        >
          <span
            aria-hidden
            className="mb-2.5 block text-[10px] tracking-[0.28em] text-gold uppercase"
          >
            Seguí explorando
          </span>
          <h2
            id="relacionados"
            className="mb-12 font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em] text-cream"
          >
            También te puede interesar
          </h2>
          <ul className="grid grid-cols-1 border-x-[0.5px] border-t-[0.5px] border-hairline min-[421px]:grid-cols-2 min-[720px]:grid-cols-3">
            {related.map((item) => (
              <li
                key={item.id}
                className="border-b-[0.5px] border-hairline transition-colors duration-300 hover:border-gold min-[421px]:border-r-[0.5px] min-[421px]:even:border-r-0 min-[720px]:even:border-r-[0.5px] min-[720px]:nth-[3n]:border-r-0"
              >
                <WineCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
