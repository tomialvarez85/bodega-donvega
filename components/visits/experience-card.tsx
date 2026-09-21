import { Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatDuration } from "@/lib/visits";
import { formatPrice } from "@/lib/format";
import type { Experience } from "@/lib/schema";

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

// Ficha de un paquete de visita o cata. El id permite enlazar directo (/visitas#slug).
export function ExperienceCard({ experience }: { experience: Experience }) {
  const hasPrice = Number(experience.price) > 0;

  return (
    <article
      id={experience.slug}
      aria-labelledby={`${experience.slug}-titulo`}
      className="flex scroll-mt-28 flex-col border border-hairline-mid bg-ink"
    >
      <div className="relative aspect-[4/3] border-b border-hairline bg-white/[0.03]">
        <Image
          src={experience.imageUrl}
          alt={experience.name}
          fill
          sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <li className={`${label} flex items-center gap-1.5`}>
            <Clock aria-hidden className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
            <span className="sr-only">Duración: </span>
            {formatDuration(experience.durationMinutes)}
          </li>
          {experience.maxGroupSize && (
            <li className={`${label} flex items-center gap-1.5`}>
              <Users aria-hidden className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              Hasta {experience.maxGroupSize} personas
            </li>
          )}
        </ul>

        <h2
          id={`${experience.slug}-titulo`}
          className="mt-3 font-display text-[clamp(26px,3vw,32px)] leading-[1.1] font-normal text-cream"
        >
          {experience.name}
        </h2>

        {experience.description && (
          <p className="mt-3 text-sm leading-[1.7] whitespace-pre-line text-sand">
            {experience.description}
          </p>
        )}

        <div className="mt-auto pt-6">
          <div className="mb-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-hairline pt-5">
            {hasPrice ? (
              <>
                <span className="font-display text-4xl leading-none font-light text-cream tabular-nums">
                  {formatPrice(experience.price)}
                </span>
                <span className="text-xs text-stone">{experience.priceUnit}</span>
              </>
            ) : (
              <span className="font-display text-2xl leading-none font-light text-cream">
                Precio a consultar
              </span>
            )}
          </div>
          <Link
            href={`/visitas/reservar?experiencia=${encodeURIComponent(experience.slug)}`}
            className="flex h-[52px] w-full items-center justify-center bg-wine text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.99]"
          >
            Solicitar reserva
          </Link>
        </div>
      </div>
    </article>
  );
}
