import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { getOrderWithItems } from "@/lib/order-queries";
import {
  DELIVERY_LABELS,
  formatDateTime,
  formatOrderNumber,
  paymentLabel,
} from "@/lib/orders";
import { isUuid } from "@/lib/validation/product";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedido" };

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

export default async function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const data = await getOrderWithItems(id);
  if (!data) notFound();
  const { order, items } = data;

  const number = formatOrderNumber(order.number);
  const firstName = order.customerName.trim().split(/\s+/)[0];
  const whatsapp = whatsappUrl(
    order.customerPhone,
    `Hola ${firstName}, te escribimos de Don Vega por tu pedido ${number}.`,
  );

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/admin/pedidos"
          className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
        >
          ← Volver a pedidos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-cream">
            Pedido {number}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-sand">
          Recibido el {formatDateTime(order.createdAt)}
        </p>
      </div>

      <Card title="Estado del pedido">
        <OrderStatusForm
          key={order.status}
          orderId={order.id}
          orderNumber={number}
          status={order.status}
        />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Cliente">
          <dl className="flex flex-col gap-3">
            <Detail label="Nombre">{order.customerName}</Detail>
            <Detail label="Email">
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-gold underline-offset-4 hover:underline"
              >
                {order.customerEmail}
              </a>
            </Detail>
            <Detail label="Teléfono">{order.customerPhone}</Detail>
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
              El teléfono no tiene un formato válido para WhatsApp.
            </p>
          )}
        </Card>

        <Card title="Entrega y pago">
          <dl className="flex flex-col gap-3">
            <Detail label="Modalidad de entrega">
              {DELIVERY_LABELS[order.deliveryMethod]}
            </Detail>
            {order.deliveryMethod === "envio" && (
              <Detail label="Dirección">
                {order.shippingAddress || "Sin dirección cargada"}
              </Detail>
            )}
            <Detail label="Método de pago">
              {paymentLabel(order.paymentMethod)}
            </Detail>
          </dl>
        </Card>
      </div>

      <Card title="Comentarios del cliente">
        {order.notes ? (
          <p className="text-sm leading-relaxed whitespace-pre-line text-cream">
            {order.notes}
          </p>
        ) : (
          <p className="text-sm text-stone">Sin comentarios.</p>
        )}
      </Card>

      <section className="border border-input bg-card">
        <h2 className="border-b border-input p-5 text-sm font-semibold text-cream">
          Productos ({items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
          unidades)
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sand">
                  Este pedido no tiene productos cargados.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-normal text-cream">
                  {item.productId ? (
                    <Link
                      href={`/admin/productos/${item.productId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <>
                      {item.productName}
                      <span className="block text-xs text-stone">
                        Producto eliminado del catálogo
                      </span>
                    </>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                Total
              </TableCell>
              <TableCell className="text-right text-base font-semibold tabular-nums">
                {formatPrice(order.total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>
    </div>
  );
}
