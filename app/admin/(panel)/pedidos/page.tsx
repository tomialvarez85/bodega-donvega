import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { listOrders, ORDERS_LIMIT } from "@/lib/order-queries";
import {
  formatDateTime,
  formatOrderNumber,
  isOrderStatus,
  ORDER_STATUSES,
  parseDateParam,
  STATUS_LABELS,
} from "@/lib/orders";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

const controlClass =
  "h-10 border border-input bg-card px-3 text-sm text-cream outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25";

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const rawStatus = first(params.estado);
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
  const desde = parseDateParam(first(params.desde));
  const hasta = parseDateParam(first(params.hasta));
  const hasFilters = Boolean(status || desde || hasta);

  const rows = await listOrders({ status, desde, hasta });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-cream">Pedidos</h1>
        <p className="text-sm text-sand">
          {rows.length} {rows.length === 1 ? "pedido" : "pedidos"}
          {hasFilters ? " con los filtros aplicados" : ""}
          {rows.length === ORDERS_LIMIT
            ? ` (se muestran los ${ORDERS_LIMIT} más recientes; afiná con los filtros)`
            : ""}
        </p>
      </div>

      <form role="search" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium text-cream">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={status ?? ""}
            className={cn(controlClass, "min-w-40")}
          >
            <option value="">Todos</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="desde" className="text-sm font-medium text-cream">
            Desde
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={desde}
            className={controlClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hasta" className="text-sm font-medium text-cream">
            Hasta
          </label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            defaultValue={hasta}
            className={controlClass}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="h-10 border-input bg-card px-4"
        >
          Filtrar
        </Button>
        {hasFilters && (
          <Link
            href="/admin/pedidos"
            className="px-2 pb-2.5 text-sm text-sand underline underline-offset-4 hover:text-cream"
          >
            Limpiar
          </Link>
        )}
      </form>

      <div className="border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Pedido</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sand"
                >
                  {hasFilters
                    ? "Ningún pedido coincide con los filtros."
                    : "Todavía no hay pedidos."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium tabular-nums">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="-m-2 inline-block p-2 text-gold underline-offset-4 hover:underline"
                  >
                    {formatOrderNumber(order.number)}
                  </Link>
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell className="whitespace-normal text-cream">
                  {order.customerName}
                  {/* En pantallas chicas, fecha y teléfono van acá. */}
                  <span className="block text-xs text-stone tabular-nums md:hidden">
                    {formatDateTime(order.createdAt)}
                  </span>
                  <span className="block text-xs text-stone tabular-nums lg:hidden">
                    {order.customerPhone}
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums lg:table-cell">
                  {order.customerPhone}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(order.total)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    aria-label={`Ver pedido ${formatOrderNumber(order.number)}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-input bg-card",
                    )}
                  >
                    Ver detalle
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
