import type { Metadata } from "next";
import Link from "next/link";

import { ghostButton } from "@/components/home/buttons";
import { ExperienceCard } from "@/components/visits/experience-card";
import { getActiveExperiences } from "@/lib/experiences";

export const metadata: Metadata = {
  title: "Visitas y Catas",
  description:
    "Visitá la bodega Don Vega en Tinogasta, Catamarca, a 1.230 msnm: recorridos por el viñedo y catas guiadas. Solicitá tu reserva online.",
};

// Se lee la base en cada visita: los paquetes cambian desde el panel de admin.
export const dynamic = "force-dynamic";

const gutter = "px-[clamp(20px,5vw,80px)]";

export default async function VisitasPage() {
  const experiences = await getActiveExperiences();

  return (
    <div>
      <header
        className={`border-b border-hairline pt-14 pb-10 md:pt-20 ${gutter}`}
      >
        <p className="mb-3 text-[10px] tracking-[0.18em] text-sand uppercase">
          Tinogasta, Catamarca · 1.230 msnm
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
          Visitas y Catas
        </h1>
        <div className="my-6 h-px w-10 bg-gold" />
        <p className="max-w-2xl text-base leading-[1.75] text-sand">
          Conocer una bodega es entender el vino desde su origen. Te esperamos
          en Tinogasta, a 1.230 metros sobre el nivel del mar, para recorrer el
          viñedo de parral antiguo, ver cómo se elaboran nuestros vinos y
          probarlos donde nacen.
        </p>
      </header>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-8 h-px w-16 bg-gold" />
          <p className="mb-4 text-[10px] tracking-[0.18em] text-sand uppercase">
            Sin paquetes por ahora
          </p>
          <h2 className="mb-3 max-w-xl font-display text-[clamp(24px,3.4vw,36px)] leading-[1.15] font-light text-cream">
            Hoy no hay visitas disponibles para reservar
          </h2>
          <p className="mb-9 max-w-[380px] text-[13px] leading-[1.7] text-sand">
            Volvé pronto: cuando abramos nuevos recorridos y catas los vas a
            encontrar acá. Mientras tanto, podés conocer nuestros vinos.
          </p>
          <Link href="/catalogo" className={ghostButton}>
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <>
          <section
            aria-label="Paquetes de visitas y catas"
            className={`mx-auto max-w-[1440px] py-[72px] ${gutter}`}
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="como-funciona"
            className={`border-t border-hairline py-[56px] ${gutter}`}
          >
            <div className="mx-auto max-w-[1440px]">
              <h2
                id="como-funciona"
                className="mb-2 font-display text-[clamp(24px,3vw,30px)] leading-[1.1] font-normal text-cream"
              >
                Cómo funciona
              </h2>
              <p className="max-w-2xl text-sm leading-[1.7] text-sand">
                Las visitas se coordinan con la bodega. Al solicitar una reserva
                nos dejás tu fecha preferida y, con esos datos, nos contactamos
                para confirmar día y horario. La solicitud no es una reserva
                confirmada hasta que te escribamos.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
