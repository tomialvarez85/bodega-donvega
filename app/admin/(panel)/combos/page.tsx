import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DeleteComboButton } from "@/components/admin/delete-combo-button";
import {
  ComboActiveCell,
  ComboPriceCell,
} from "@/components/admin/inline/inline-cells";
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
import { getAdminCombos } from "@/lib/combos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Combos" };

export default async function AdminCombosPage() {
  await requireAdmin();
  const rows = await getAdminCombos();

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-cream">Combos</h1>
          <p className="text-sm text-sand">
            {rows.length} {rows.length === 1 ? "combo" : "combos"}
          </p>
        </div>
        <Link
          href="/admin/combos/nuevo"
          className={cn(
            buttonVariants(),
            "h-10 gap-2 px-4 text-sm font-medium",
          )}
        >
          <Plus aria-hidden />
          Nuevo combo
        </Link>
      </div>

      <div className="border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-24">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden text-right xl:table-cell">
                Precio
              </TableHead>
              <TableHead className="hidden sm:table-cell">Incluye</TableHead>
              <TableHead className="hidden xl:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sand"
                >
                  Todavía no hay combos. Creá el primero con «Nuevo combo».
                </TableCell>
              </TableRow>
            )}
            {rows.map((combo) => (
              <TableRow key={combo.id}>
                <TableCell>
                  <div className="relative h-14 w-[72px] bg-muted">
                    <Image
                      src={combo.imageUrl}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium whitespace-normal text-cream">
                  {combo.name}
                  <span className="block text-xs font-normal text-stone">
                    /promociones#{combo.slug}
                  </span>
                  {/* En pantallas chicas, los datos de las columnas ocultas van acá. */}
                  <span className="mt-2 flex flex-col items-start gap-2 font-normal xl:hidden">
                    <ComboPriceCell
                      id={combo.id}
                      name={combo.name}
                      price={combo.price}
                    />
                    <ComboActiveCell
                      id={combo.id}
                      name={combo.name}
                      active={combo.active}
                    />
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ComboPriceCell
                    id={combo.id}
                    name={combo.name}
                    price={combo.price}
                  />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {combo.lines === 0 ? (
                    <Badge className="bg-amber-500/15 text-amber-300">
                      Sin vinos
                    </Badge>
                  ) : (
                    <span className="tabular-nums">
                      {combo.lines} {combo.lines === 1 ? "vino" : "vinos"}
                      <span className="block text-xs text-stone">
                        {combo.bottles}{" "}
                        {combo.bottles === 1 ? "botella" : "botellas"}
                      </span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ComboActiveCell
                    id={combo.id}
                    name={combo.name}
                    active={combo.active}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/combos/${combo.id}`}
                      aria-label={`Editar ${combo.name}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "border-input bg-card h-10 w-10 px-0 xl:h-7 xl:w-auto xl:px-2.5",
                      )}
                    >
                      <Pencil aria-hidden />
                      <span className="hidden xl:inline">Editar</span>
                    </Link>
                    <DeleteComboButton id={combo.id} name={combo.name} />
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
