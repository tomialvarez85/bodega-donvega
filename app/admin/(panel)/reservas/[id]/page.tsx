import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VisitStatusBadge } from "@/components/admin/visit-status-badge";
import { VisitStatusForm } from "@/components/admin/visit-status-form";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/orders";
import { getVisitRequestDetail } from "@/lib/visit-queries";
import { isUuid } from "@/lib/validation/product";
import { contactWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Solicitud de visita" };

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-wide text-stone uppercase">
        {label}
      </dt>
      <dd className="text-sm text-cream">{children}</dd>
    </div>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-input bg-card p-5", className)}>
      <h2 className="mb-4 text-sm font-semibold text-cream">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const data = await getVisitRequestDetail(id);
  if (!data) notFound();
  const { request, experienceId, experienceName } = data;

  const firstName = request.customerName.trim().split(/\s+/)[0];
  const whatsapp = contactWhatsappUrl(
    request.phone,
    `Hola ${firstName}, te escribimos de Don Vega por tu solicitud de visita (${experienceName}, ${request.preferredDate}, ${request.groupSize} ${request.groupSize === 1 ? "persona" : "personas"}).`,
  );

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/admin/reservas"
          className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
        >
          ← Volver a reservas
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-cream">
            Solicitud de {request.customerName}
          </h1>
          <VisitStatusBadge status={request.status} />
        </div>
        <p className="text-sm text-sand">
          Recibida el {formatDateTime(request.createdAt)}
        </p>
      </div>

      <Card title="Estado de la solicitud">
        <VisitStatusForm
          key={request.status}
          requestId={request.id}
          customerName={request.customerName}
          status={request.status}
        />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Cliente">
          <dl className="flex flex-col gap-3">
            <Detail label="Nombre">{request.customerName}</Detail>
            <Detail label="Email">
              <a
                href={`mailto:${request.email}`}
                className="text-gold underline-offset-4 hover:underline"
              >
                {request.email}
              </a>
            </Detail>
            <Detail label="Teléfono">{request.phone}</Detail>
          </dl>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-5 h-10 gap-2 border-input bg-card px-4 text-sm",
              )}
            >
              <MessageCircle aria-hidden />
              Contactar por WhatsApp
            </a>
          ) : (
            <p className="mt-5 text-xs text-stone">
              El teléfono no tiene un formato válido para WhatsApp (falta el código
              de país). Escribile por email.
            </p>
          )}
        </Card>

        <Card title="Visita solicitada">
          <dl className="flex flex-col gap-3">
            <Detail label="Paquete">
              <Link
                href={`/admin/visitas/${experienceId}`}
                className="underline-offset-4 hover:underline"
              >
                {experienceName}
              </Link>
            </Detail>
            <Detail label="Fecha preferida">{request.preferredDate}</Detail>
            <Detail label="Cantidad de personas">
              <span className="tabular-nums">{request.groupSize}</span>
            </Detail>
          </dl>
        </Card>
      </div>

      <Card title="Comentarios del cliente">
        {request.comments ? (
          <p className="text-sm leading-relaxed whitespace-pre-line text-cream">
            {request.comments}
          </p>
        ) : (
          <p className="text-sm text-stone">Sin comentarios.</p>
        )}
      </Card>
    </div>
  );
}
