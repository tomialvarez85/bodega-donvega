"use client";

import Link from "next/link";
import { useState } from "react";

import { FilterGroups } from "@/components/catalog/filter-groups";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CatalogFilters } from "@/lib/catalog-params";

// Drawer de filtros para pantallas donde no entra la barra lateral (< 900px).
export function MobileFilters({
  filters,
  varietals,
  hasFilters,
}: {
  filters: CatalogFilters;
  varietals: string[];
  hasFilters: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir filtros"
        className="flex items-center gap-[7px] border-[0.5px] border-hairline-mid px-3.5 py-1.5 text-[10px] tracking-[0.12em] text-sand uppercase transition-colors hover:text-cream min-[900px]:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="0.75" />
          <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.75" />
          <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="0.75" />
        </svg>
        Filtrar
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          showCloseButton={false}
          overlayClassName="bg-ink/70 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none"
          className="gap-0 border-hairline bg-ink px-5 py-6 text-cream shadow-none data-[side=right]:w-[min(280px,80vw)] data-[side=right]:sm:max-w-none"
        >
          <div className="mb-7 flex items-center justify-between border-b-[0.5px] border-hairline pb-4">
            <SheetTitle className="font-display text-xl font-normal text-cream">
              Filtros
            </SheetTitle>
            <SheetDescription className="sr-only">
              Filtrar los vinos por línea y varietal.
            </SheetDescription>
            <SheetClose
              aria-label="Cerrar filtros"
              className="p-1 text-cream"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="0.75" />
                <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="0.75" />
              </svg>
            </SheetClose>
          </div>

          <FilterGroups
            filters={filters}
            varietals={varietals}
            onNavigate={() => setOpen(false)}
          />

          {hasFilters && (
            <Link
              href="/catalogo"
              scroll={false}
              onClick={() => setOpen(false)}
              className="mt-8 block bg-wine py-3 text-center text-[10px] tracking-[0.14em] text-cream uppercase"
            >
              Limpiar filtros
            </Link>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
