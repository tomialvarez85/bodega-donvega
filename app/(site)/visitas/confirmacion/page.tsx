import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ghostButton } from "@/components/home/buttons";
import { getVisitRequestWithExperience } from "@/lib/experiences";
import { buildVisitWhatsappMessage } from "@/lib/visit-message";
import { isUuid } from "@/lib/validation/product";
import { businessWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Solicitud recibida",
  robots: { index: false, follow: false },
};

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

export default async function VisitConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { solicitud } = await searchParams;
  const id = Array.isArray(solicitud) ? solicitud[0] : solicitud;
  // El id de la solicitud (uuid) es el "permiso" para ver esta página: no se puede adivinar.
  if (!id || !isUuid(id)) notFound();

  const data = await getVisitRequestWithExperience(id);
  if (!data) notFound();
  const { request, experienceName } = data;

  const whatsapp = businessWhatsappUrl(
    buildVisitWhatsappMessage(request, experienceName),
  );

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)] pt-14 pb-24 md:pt-20">
      <header className="mb-12 flex max-w-2xl flex-col items-start gap-4">
        <p className={label}>Solicitud de visita</p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.05] font-light tracking-[0.01em] text-cream">
          ¡Recibimos tu solicitud!
        </h1>
        <div className="h-px w-10 bg-gold" />
        <p className="text-base leading-[1.75] text-sand">
          Gracias, {request.customerName.split(" ")[0]}. La bodega se va a
          contactar con vos por WhatsApp al{" "}
          <span className="text-cream">{request.phone}</span> o por email para
          confirmar fecha y horario.
        </p>
        <p
          role="note"
          className="border-l-2 border-gold bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-cream"
        >
          Todavía <strong className="font-medium">no es una reserva confirmada</strong>:
          tu visita queda reservada recién cuando la bodega te confirme el día y
          el horario.
        </p>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex h-[52px] items-center justify-center bg-wine px-8 text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.99]"
          >
            Continuar por WhatsApp
          </a>
        )}
      </header>

      <section
        aria-labelledby="detalle-titulo"
        className="max-w-xl border border-hairline-mid bg-card p-6 lg:p-8"
      >
        <h2
          id="detalle-titulo"
          className="mb-6 font-display text-[26px] leading-none font-normal text-cream"
        >
          Lo que nos pediste
        </h2>
        <dl className="flex flex-col gap-5">
          <div>
            <dt className={label}>Paquete</dt>
            <dd className="mt-1 text-sm text-cream">{experienceName}</dd>
          </div>
          <div>
            <dt className={label}>Fecha preferida</dt>
            <dd className="mt-1 text-sm text-cream">{request.preferredDate}</dd>
          </div>
          <div>
            <dt className={label}>Personas</dt>
            <dd className="mt-1 text-sm text-cream tabular-nums">
              {request.groupSize}
            </dd>
          </div>
          <div>
            <dt className={label}>Contacto</dt>
            <dd className="mt-1 text-sm text-cream">
              {request.customerName}
              <span className="block text-sand">{request.email}</span>
            </dd>
          </div>
          {request.comments && (
            <div>
              <dt className={label}>Tus comentarios</dt>
              <dd className="mt-1 text-sm whitespace-pre-line text-sand">
                {request.comments}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link href="/visitas" className={ghostButton}>
          Ver otras experiencias
        </Link>
        <Link href="/catalogo" className={ghostButton}>
          Conocer nuestros vinos
        </Link>
      </div>
    </div>
  );
}
