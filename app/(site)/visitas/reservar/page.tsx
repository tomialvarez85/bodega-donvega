import type { Metadata } from "next";
import Link from "next/link";

import { ghostButton } from "@/components/home/buttons";
import { VisitRequestForm } from "@/components/visits/visit-request-form";
import { getActiveExperiences } from "@/lib/experiences";

export const metadata: Metadata = {
  title: "Solicitar reserva",
  description: "Pedí tu visita o cata en la bodega Don Vega, en Tinogasta.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { experiencia } = await searchParams;
  const slug = Array.isArray(experiencia) ? experiencia[0] : experiencia;

  const experiences = await getActiveExperiences();
  // Un slug inexistente o inactivo simplemente no preselecciona nada.
  const initial = experiences.find((experience) => experience.slug === slug);

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)] pt-14 pb-24 md:pt-20">
      <header className="mb-4 flex flex-col items-start gap-4">
        <p className="text-[10px] tracking-[0.18em] text-sand uppercase">
          <Link
            href="/visitas"
            className="underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Visitas y Catas
          </Link>
          <span aria-hidden> / </span>
          Solicitar reserva
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
          Solicitar reserva
        </h1>
        <div className="h-px w-10 bg-gold" />
        <p className="max-w-xl text-base leading-[1.75] text-sand">
          Completá el formulario y la bodega se contacta con vos para confirmar
          fecha y horario.
        </p>
      </header>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-start gap-5 border-t border-hairline-mid py-12">
          <p className="max-w-xl font-display text-3xl leading-tight font-light text-cream">
            Por ahora no hay paquetes disponibles para reservar.
          </p>
          <Link href="/visitas" className={ghostButton}>
            Volver a Visitas y Catas
          </Link>
        </div>
      ) : (
        <VisitRequestForm
          // Si cambia el paquete de la URL, se reinicia el formulario con la nueva preselección.
          key={initial?.id ?? "none"}
          experiences={experiences.map((experience) => ({
            id: experience.id,
            name: experience.name,
            price: experience.price,
            priceUnit: experience.priceUnit,
            durationMinutes: experience.durationMinutes,
            maxGroupSize: experience.maxGroupSize,
          }))}
          initialExperienceId={initial?.id ?? ""}
        />
      )}
    </div>
  );
}
