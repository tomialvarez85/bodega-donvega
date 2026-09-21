import type { Metadata } from "next";
import Link from "next/link";

import { WineCard } from "@/components/catalog/wine-card";
import { ghostButton } from "@/components/home/buttons";
import { ComboCard } from "@/components/promotions/combo-card";
import { getPromotions } from "@/lib/promotions";

export const metadata: Metadata = {
  title: "Selección especial",
  description:
    "Vinos con precio especial y combos de varias botellas de Don Vega.",
};

// Se lee la base en cada visita: las promociones cambian desde el panel de admin.
export const dynamic = "force-dynamic";

const gutter = "px-[clamp(20px,5vw,80px)]";

function SectionHead({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      <span
        aria-hidden
        className="mb-2.5 block text-[10px] tracking-[0.28em] text-gold uppercase"
      >
        {eyebrow}
      </span>
      <h2
        id={id}
        className="font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em] text-cream"
      >
        {title}
      </h2>
    </div>
  );
}

export default async function PromocionesPage() {
  const { onSale, combos } = await getPromotions();
  const isEmpty = onSale.length === 0 && combos.length === 0;

  return (
    <div>
      <header
        className={`border-b border-hairline pt-14 pb-10 md:pt-20 ${gutter}`}
      >
        <p className="mb-3 text-[10px] tracking-[0.18em] text-sand uppercase">
          Selección especial
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
          Promociones
        </h1>
        <div className="my-6 h-px w-10 bg-gold" />
        <p className="max-w-xl text-base leading-[1.75] text-sand">
          Vinos con precio especial y combos para probar, regalar o guardar.
          Cuando termina una promoción, sale de esta página.
        </p>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-8 h-px w-16 bg-gold" />
          <p className="mb-4 text-[10px] tracking-[0.18em] text-sand uppercase">
            Sin promociones por ahora
          </p>
          <h2 className="mb-3 max-w-xl font-display text-[clamp(24px,3.4vw,36px)] leading-[1.15] font-light text-cream">
            Hoy no hay ofertas ni combos vigentes
          </h2>
          <p className="mb-9 max-w-[380px] text-[13px] leading-[1.7] text-sand">
            Volvé pronto: cuando haya una nueva selección la vas a encontrar
            acá. Mientras tanto, podés recorrer toda la colección.
          </p>
          <Link href="/catalogo" className={ghostButton}>
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <>
          {onSale.length > 0 && (
            <section
              aria-labelledby="vinos-en-oferta"
              className={`mx-auto max-w-[1440px] py-[72px] ${gutter}`}
            >
              <SectionHead
                id="vinos-en-oferta"
                eyebrow="Precio especial"
                title="Vinos en oferta"
              />
              <ul className="grid grid-cols-1 border-x-[0.5px] border-t-[0.5px] border-hairline min-[421px]:grid-cols-2 min-[720px]:grid-cols-3">
                {onSale.map((product) => (
                  <li
                    key={product.id}
                    className="border-b-[0.5px] border-hairline transition-colors duration-300 hover:border-gold min-[421px]:border-r-[0.5px] min-[421px]:even:border-r-0 min-[720px]:even:border-r-[0.5px] min-[720px]:nth-[3n]:border-r-0"
                  >
                    <WineCard product={product} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {combos.length > 0 && (
            <section
              aria-labelledby="combos"
              className={`mx-auto max-w-[1440px] py-[72px] ${gutter} ${
                onSale.length > 0 ? "border-t border-hairline" : ""
              }`}
            >
              <SectionHead id="combos" eyebrow="Varias botellas" title="Combos" />
              <div className="grid gap-6 lg:grid-cols-2">
                {combos.map((combo) => (
                  <ComboCard key={combo.id} combo={combo} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
