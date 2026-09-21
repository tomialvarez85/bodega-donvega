import type { Metadata } from "next";
import Link from "next/link";

import { VisitStatusBadge } from "@/components/admin/visit-status-badge";
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
import { formatDateTime } from "@/lib/orders";
import { listVisitRequests, VISIT_REQUESTS_LIMIT } from "@/lib/visit-queries";
import {
  isVisitRequestStatus,
  VISIT_REQUEST_STATUSES,
  VISIT_STATUS_LABELS,
} from "@/lib/visits";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reservas" };

const controlClass =
  "h-10 border border-input bg-card px-3 text-sm text-cream outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25";

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const rawStatus = first(params.estado);
  const status = isVisitRequestStatus(rawStatus) ? rawStatus : undefined;

  const rows = await listVisitRequests(status);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-cream">Reservas</h1>
        <p className="text-sm text-sand">
          {rows.length} {rows.length === 1 ? "solicitud" : "solicitudes"} de visita
          {status ? ` en estado «${VISIT_STATUS_LABELS[status]}»` : ""}
          {rows.length === VISIT_REQUESTS_LIMIT
            ? ` (se muestran las ${VISIT_REQUESTS_LIMIT} más recientes; filtrá por estado para afinar)`
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
            {VISIT_REQUEST_STATUSES.map((value) => (
              <option key={value} value={value}>
                {VISIT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="h-10 border-input bg-card px-4"
        >
          Filtrar
        </Button>
        {status && (
          <Link
            href="/admin/reservas"
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
              <TableHead className="hidden xl:table-cell">Solicitada</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Paquete</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha preferida</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Personas</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sand">
                  {status
                    ? "Ninguna solicitud tiene ese estado."
                    : "Todavía no hay solicitudes de reserva."}
                </TableCell>
              </TableRow>
            )}
            {rows.map(({ request, experienceName }) => (
              <TableRow key={request.id}>
                <TableCell className="hidden tabular-nums xl:table-cell">
                  {formatDateTime(request.createdAt)}
                </TableCell>
                <TableCell className="font-medium whitespace-normal text-cream">
                  <Link
                    href={`/admin/reservas/${request.id}`}
                    className="-m-2 inline-block p-2 text-gold underline-offset-4 hover:underline"
                  >
                    {request.customerName}
                  </Link>
                  {/* En pantallas chicas, los datos de las columnas ocultas van acá. */}
                  <span className="block text-xs font-normal text-stone md:hidden">
                    {experienceName}
                  </span>
                  <span className="block text-xs font-normal text-stone lg:hidden">
                    {request.preferredDate} · {request.groupSize}{" "}
                    {request.groupSize === 1 ? "persona" : "personas"}
                  </span>
                  <span className="block text-xs font-normal text-stone tabular-nums xl:hidden">
                    Solicitada el {formatDateTime(request.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="hidden whitespace-normal text-cream md:table-cell">
                  {experienceName}
                </TableCell>
                <TableCell className="hidden whitespace-normal lg:table-cell">
                  {request.preferredDate}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {request.groupSize}
                </TableCell>
                <TableCell className="hidden tabular-nums lg:table-cell">
                  {request.phone}
                </TableCell>
                <TableCell>
                  <VisitStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  <Link
                    href={`/admin/reservas/${request.id}`}
                    aria-label={`Ver solicitud de ${request.customerName}`}
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
