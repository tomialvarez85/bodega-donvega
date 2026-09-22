import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DeleteExperienceButton } from "@/components/admin/delete-experience-button";
import {
  ExperienceActiveCell,
  ExperiencePriceCell,
} from "@/components/admin/inline/inline-cells";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Visitas" };

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
              <TableHead className="hidden text-right xl:table-cell">
                Precio
              </TableHead>
              <TableHead className="hidden xl:table-cell">Estado</TableHead>
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
                  <span className="mt-2 flex flex-col items-start gap-2 font-normal xl:hidden">
                    <span className="text-xs text-stone tabular-nums sm:hidden">
                      {formatDuration(experience.durationMinutes)}
                      {experience.maxGroupSize
                        ? ` · hasta ${experience.maxGroupSize} personas`
                        : ""}
                    </span>
                    <ExperiencePriceCell
                      id={experience.id}
                      name={experience.name}
                      price={experience.price}
                      unit={experience.priceUnit}
                    />
                    <ExperienceActiveCell
                      id={experience.id}
                      name={experience.name}
                      active={experience.active}
                    />
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {formatDuration(experience.durationMinutes)}
                  {experience.maxGroupSize && (
                    <span className="block text-xs text-stone">
                      Hasta {experience.maxGroupSize} personas
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ExperiencePriceCell
                    id={experience.id}
                    name={experience.name}
                    price={experience.price}
                    unit={experience.priceUnit}
                  />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ExperienceActiveCell
                    id={experience.id}
                    name={experience.name}
                    active={experience.active}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/visitas/${experience.id}`}
                      aria-label={`Editar ${experience.name}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "border-input bg-card h-10 w-10 px-0 xl:h-7 xl:w-auto xl:px-2.5",
                      )}
                    >
                      <Pencil aria-hidden />
                      <span className="hidden xl:inline">Editar</span>
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
