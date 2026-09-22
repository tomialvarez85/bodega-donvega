import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { ComboWithItems } from "@/lib/promotions";
import { businessWhatsappUrl } from "@/lib/whatsapp";

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

// Ficha de un combo: imagen, nombre, descripción, contenido con cantidades y precio.
// Todo el detalle está a la vista; el id permite enlazar directo (/promociones#slug).
export function ComboCard({ combo }: { combo: ComboWithItems }) {
  const saving =
    combo.separatePrice != null && combo.separatePrice > Number(combo.price)
      ? combo.separatePrice - Number(combo.price)
      : null;

  // Mientras el combo no se pueda comprar desde el carrito, se consulta por WhatsApp.
  const whatsapp = businessWhatsappUrl(
    `Hola Don Vega, me interesa el combo "${combo.name}". ¿Me pasan más información?`,
  );

  return (
    <article
      id={combo.slug}
      aria-labelledby={`${combo.slug}-titulo`}
      className="flex scroll-mt-28 flex-col border border-hairline-mid bg-ink sm:flex-row lg:flex-col xl:flex-row"
    >
      <div className="relative aspect-[4/3] shrink-0 border-b border-hairline bg-white/[0.03] sm:w-[42%] sm:border-r sm:border-b-0 lg:w-auto lg:border-r-0 lg:border-b xl:w-[42%] xl:border-r xl:border-b-0">
        <Image
          src={combo.imageUrl}
          alt={`Combo ${combo.name}`}
          fill
          sizes="(min-width: 1280px) 260px, (min-width: 640px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
        <p className={label}>
          Combo · {combo.bottles} {combo.bottles === 1 ? "botella" : "botellas"}
        </p>
        <h3
          id={`${combo.slug}-titulo`}
          className="mt-2 font-display text-[clamp(24px,3vw,30px)] leading-[1.1] font-normal text-cream"
        >
          {combo.name}
        </h3>

        {combo.description && (
          <p className="mt-3 text-sm leading-[1.7] whitespace-pre-line text-sand">
            {combo.description}
          </p>
        )}

        <div className="mt-5 border-t border-hairline pt-4">
          <p className={label}>Incluye</p>
          <ul className="mt-3 flex flex-col gap-2">
            {combo.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-baseline gap-3 text-sm text-cream"
              >
                <span className="w-7 shrink-0 font-display text-lg text-gold tabular-nums">
                  {item.quantity}×
                </span>
                {item.active ? (
                  <Link
                    href={`/productos/${item.slug}`}
                    className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span>{item.name}</span>
                )}
                <span className="text-xs text-stone">{item.varietal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-4xl leading-none font-light text-cream tabular-nums">
              {formatPrice(combo.price)}
            </span>
            {saving != null && combo.separatePrice != null && (
              <span className="text-xs text-stone">
                <span className="sr-only">Precio de las botellas por separado: </span>
                <s className="tabular-nums">{formatPrice(combo.separatePrice)}</s>
                <span className="ml-2 font-display text-sm text-gold italic">
                  ahorrás {formatPrice(saving)}
                </span>
              </span>
            )}
          </div>

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] mt-5 inline-flex border-b border-gold pb-1 text-[10px] tracking-[0.18em] text-gold uppercase transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Consultar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
