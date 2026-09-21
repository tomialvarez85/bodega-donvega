import type { Metadata } from "next";
import Link from "next/link";

import { CatalogSearch } from "@/components/catalog/catalog-search";
import { FilterGroups } from "@/components/catalog/filter-groups";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { WineCard } from "@/components/catalog/wine-card";
import { catalogHref, parseCatalogParams } from "@/lib/catalog-params";
import { getCatalogProducts, getCatalogVarietals } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Los vinos de Don Vega: tintos de altura elaborados en Tinogasta, Catamarca. Líneas DV y ADN.",
};

const pageGutter = "px-[clamp(16px,4vw,48px)]";

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Quitar filtro ${label}`}
      className="inline-flex items-center gap-1.5 border-[0.5px] border-wine px-2.5 py-1 text-[9px] tracking-[0.14em] text-cream uppercase"
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <line x1="1" y1="1" x2="9" y2="9" stroke="#b09e8a" strokeWidth="0.75" />
        <line x1="9" y1="1" x2="1" y2="9" stroke="#b09e8a" strokeWidth="0.75" />
      </svg>
    </Link>
  );
}

function EmptyState({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-8 opacity-[0.12]" aria-hidden>
        <svg width="28" height="73" viewBox="0 0 40 104" fill="none">
          <rect x="16" y="0" width="8" height="22" stroke="#f7f3ec" strokeWidth="0.5" />
          <path
            d="M16 22 C12 28 8 32 8 40 L8 92 C8 98 11 100 20 100 C29 100 32 98 32 92 L32 40 C32 32 28 28 24 22 Z"
            stroke="#f7f3ec"
            strokeWidth="0.5"
          />
          <line x1="10" y1="55" x2="30" y2="55" stroke="#f7f3ec" strokeWidth="0.5" opacity="0.4" />
          <line x1="10" y1="75" x2="30" y2="75" stroke="#f7f3ec" strokeWidth="0.5" opacity="0.4" />
          <rect x="15" y="-4" width="10" height="6" fill="#f7f3ec" opacity="0.6" />
        </svg>
      </div>
      <p className="mb-4 text-[10px] tracking-[0.18em] text-sand uppercase">
        Sin resultados
      </p>
      <h2 className="mb-3 max-w-xl font-display text-[clamp(22px,3vw,32px)] leading-[1.15] font-light text-cream">
        {description}
      </h2>
      <p className="mb-8 max-w-[360px] text-[13px] leading-[1.7] text-sand">
        Ajustá los filtros o explorá toda la colección Don Vega sin
        restricciones.
      </p>
      <Link
        href="/catalogo"
        scroll={false}
        className="bg-wine px-7 py-[11px] text-[10px] tracking-[0.16em] text-cream uppercase transition-colors hover:bg-wine/85"
      >
        Ver toda la colección
      </Link>
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseCatalogParams(await searchParams);
  const [products, varietals] = await Promise.all([
    getCatalogProducts(filters),
    getCatalogVarietals(),
  ]);

  const hasFilters = Boolean(filters.linea || filters.varietal || filters.q);
  const emptyFilter =
    filters.q ??
    (filters.linea ? `Línea ${filters.linea}` : undefined) ??
    filters.varietal;

  return (
    <div className="bg-ink text-cream">
      <section
        className={`border-b-[0.5px] border-hairline pt-12 pb-10 ${pageGutter}`}
      >
        <p className="mb-3 text-[10px] tracking-[0.18em] text-sand uppercase">
          Colección
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
            Nuestros Vinos
          </h1>
          <CatalogSearch filters={filters} />
        </div>

        {hasFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[9px] tracking-[0.14em] text-sand uppercase">
              Filtros:
            </span>
            {filters.linea && (
              <Chip
                href={catalogHref({ ...filters, linea: undefined })}
                label={`Línea ${filters.linea}`}
              />
            )}
            {filters.varietal && (
              <Chip
                href={catalogHref({ ...filters, varietal: undefined })}
                label={filters.varietal}
              />
            )}
            {filters.q && (
              <Chip
                href={catalogHref({ ...filters, q: undefined })}
                label={`"${filters.q}"`}
              />
            )}
            <Link
              href="/catalogo"
              scroll={false}
              className="ml-1 text-[9px] tracking-[0.14em] text-gold uppercase underline-offset-4 hover:underline"
            >
              Limpiar todo
            </Link>
          </div>
        )}
      </section>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-[257px] shrink-0 border-r-[0.5px] border-hairline px-7 py-8 min-[900px]:block">
          <FilterGroups filters={filters} varietals={varietals} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b-[0.5px] border-hairline px-[clamp(12px,3vw,24px)] py-3">
            <span aria-live="polite" className="text-[11px] text-sand">
              {products.length} {products.length === 1 ? "vino" : "vinos"}
            </span>
            <MobileFilters
              filters={filters}
              varietals={varietals}
              hasFilters={hasFilters}
            />
          </div>

          {products.length > 0 ? (
            <ul className="grid grid-cols-1 border-x-[0.5px] border-hairline min-[421px]:grid-cols-2 min-[720px]:grid-cols-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="border-b-[0.5px] border-hairline transition-colors duration-300 hover:border-gold min-[421px]:border-r-[0.5px] min-[421px]:even:border-r-0 min-[720px]:even:border-r-[0.5px] min-[720px]:nth-[3n]:border-r-0"
                >
                  <WineCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              description={
                emptyFilter
                  ? `Ningún vino coincide con "${emptyFilter}"`
                  : "Ningún vino coincide con los filtros aplicados"
              }
            />
          )}
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
