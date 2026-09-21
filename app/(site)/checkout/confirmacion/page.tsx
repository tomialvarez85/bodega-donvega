import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ghostButton } from "@/components/home/buttons";
import { formatPrice } from "@/lib/format";
import { buildOrderWhatsappMessage } from "@/lib/order-message";
import { getOrderWithItems } from "@/lib/order-queries";
import {
  DELIVERY_LABELS,
  formatOrderNumber,
  paymentLabel,
} from "@/lib/orders";
import { isUuid } from "@/lib/validation/product";
import { businessWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pedido recibido",
  robots: { index: false, follow: false },
};

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { pedido } = await searchParams;
  const id = Array.isArray(pedido) ? pedido[0] : pedido;
  // El id del pedido (uuid) es el "permiso" para ver esta página: no se puede adivinar.
  if (!id || !isUuid(id)) notFound();

  const data = await getOrderWithItems(id);
  if (!data) notFound();
  const { order, items } = data;

  const number = formatOrderNumber(order.number);
  const whatsapp = businessWhatsappUrl(buildOrderWhatsappMessage(order, items));

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)] pt-14 pb-24 md:pt-20">
      <header className="mb-12 flex max-w-2xl flex-col items-start gap-4">
        <p className={label}>Pedido {number}</p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.05] font-light tracking-[0.01em] text-cream">
          ¡Recibimos tu pedido!
        </h1>
        <div className="h-px w-10 bg-gold" />
        <p className="text-base leading-[1.75] text-sand">
          Gracias, {order.customerName.split(" ")[0]}. La bodega se va a
          contactar con vos por WhatsApp al{" "}
          <span className="text-cream">{order.customerPhone}</span> para
          coordinar el pago y la entrega. Todavía no se cobró nada.
        </p>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex h-[52px] items-center justify-center bg-wine px-8 text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] active:scale-[0.99]"
          >
            Continuar por WhatsApp
          </a>
        )}
      </header>

      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_400px]">
        <section aria-labelledby="detalle-titulo" className="min-w-0">
          <h2
            id="detalle-titulo"
            className="mb-6 font-display text-[26px] leading-none font-normal text-cream"
          >
            Detalle del pedido
          </h2>
          <ul className="divide-y divide-hairline border-y border-hairline-mid">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <div>
                  <p className="font-display text-xl leading-tight text-cream">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs tracking-[0.06em] text-stone tabular-nums">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-display text-xl font-light text-cream tabular-nums">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between">
            <span className={label}>Total</span>
            <span className="font-display text-4xl leading-none font-light text-cream tabular-nums">
              {formatPrice(order.total)}
            </span>
          </div>
        </section>

        <aside
          aria-label="Entrega y pago"
          className="h-fit border border-hairline-mid bg-card p-6 lg:p-8"
        >
          <dl className="flex flex-col gap-5">
            <div>
              <dt className={label}>Entrega</dt>
              <dd className="mt-1 text-sm text-cream">
                {DELIVERY_LABELS[order.deliveryMethod]}
                {order.deliveryMethod === "envio" && order.shippingAddress && (
                  <span className="mt-0.5 block text-sand">
                    {order.shippingAddress}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className={label}>Pago a coordinar</dt>
              <dd className="mt-1 text-sm text-cream">
                {paymentLabel(order.paymentMethod)}
              </dd>
            </div>
            <div>
              <dt className={label}>Contacto</dt>
              <dd className="mt-1 text-sm text-cream">
                {order.customerName}
                <span className="block text-sand">{order.customerEmail}</span>
              </dd>
            </div>
            {order.notes && (
              <div>
                <dt className={label}>Tus comentarios</dt>
                <dd className="mt-1 text-sm whitespace-pre-line text-sand">
                  {order.notes}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      <div className="mt-14">
        <Link href="/catalogo" className={ghostButton}>
          Seguir mirando vinos
        </Link>
      </div>
    </div>
  );
}
