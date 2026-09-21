import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DeleteExperienceButton } from "@/components/admin/delete-experience-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatDuration } from "@/lib/visits";
import { getAdminExperiences } from "@/lib/experiences";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Visitas" };

const priceLabel = (price: string, unit: string) =>
  Number(price) > 0 ? `${formatPrice(price)} ${unit}` : "A consultar";

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-green-500/15 text-green-300">Activo</Badge>
  ) : (
    <Badge className="bg-hairline text-sand">Inactivo</Badge>
  );
}

export default async function AdminVisitasPage() {
  await requireAdmin();
  const rows = await getAdminExperiences();

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-cream">Visitas y catas</h1>
          <p className="text-sm text-sand">
            {rows.length} {rows.length === 1 ? "paquete" : "paquetes"}
          </p>
        </div>
        <Link
          href="/admin/visitas/nuevo"
          className={cn(
            buttonVariants(),
            "h-10 gap-2 px-4 text-sm font-medium",
          )}
        >
          <Plus aria-hidden />
          Nuevo paquete
        </Link>
      </div>

      <div className="border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-24">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Duración</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Precio
              </TableHead>
              <TableHead className="hidden md:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sand">
                  Todavía no hay paquetes. Creá el primero con «Nuevo paquete».
                </TableCell>
              </TableRow>
            )}
            {rows.map((experience) => (
              <TableRow key={experience.id}>
                <TableCell>
                  <div className="relative h-14 w-[72px] bg-muted">
                    <Image
                      src={experience.imageUrl}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium whitespace-normal text-cream">
                  {experience.name}
                  <span className="block text-xs font-normal text-stone">
                    {experience.requests}{" "}
                    {experience.requests === 1 ? "solicitud" : "solicitudes"}
                  </span>
                  {/* En pantallas chicas, los datos de las columnas ocultas van acá. */}
                  <span className="mt-1 flex flex-wrap items-center gap-2 font-normal md:hidden">
                    <span className="tabular-nums">
                      {formatDuration(experience.durationMinutes)} ·{" "}
                      {priceLabel(experience.price, experience.priceUnit)}
                    </span>
                    <StatusBadge active={experience.active} />
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {formatDuration(experience.durationMinutes)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {priceLabel(experience.price, experience.priceUnit)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge active={experience.active} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/visitas/${experience.id}`}
                      aria-label={`Editar ${experience.name}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "border-input bg-card",
                      )}
                    >
                      <Pencil aria-hidden />
                      <span className="hidden lg:inline">Editar</span>
                    </Link>
                    <DeleteExperienceButton
                      id={experience.id}
                      name={experience.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
