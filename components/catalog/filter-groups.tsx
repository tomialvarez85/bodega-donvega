import Link from "next/link";

import {
  catalogHref,
  LINES,
  type CatalogFilters,
} from "@/lib/catalog-params";
import { cn } from "@/lib/utils";

const groupTitle =
  "mb-3.5 border-b-[0.5px] border-hairline pb-2.5 text-[9px] tracking-[0.18em] text-sand uppercase";

function FilterLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={onNavigate}
      aria-current={active ? "true" : undefined}
      className={cn(
        "block border-l-[1.5px] py-1.5 pl-3 text-xs transition-colors duration-200 motion-reduce:transition-none",
        active
          ? "border-wine text-cream"
          : "border-transparent text-sand hover:text-cream",
      )}
    >
      {children}
    </Link>
  );
}

// Filtros por línea y varietal como enlaces (query params): funcionan sin JavaScript.
// `onNavigate` lo usa el drawer mobile para cerrarse al elegir.
export function FilterGroups({
  filters,
  varietals,
  onNavigate,
}: {
  filters: CatalogFilters;
  varietals: string[];
  onNavigate?: () => void;
}) {
  return (
    <div>
      <nav aria-label="Filtrar por línea" className="mb-8">
        <p className={groupTitle}>Línea</p>
        <FilterLink
          href={catalogHref({ ...filters, linea: undefined })}
          active={!filters.linea}
          onNavigate={onNavigate}
        >
          Todas las líneas
        </FilterLink>
        {LINES.map((line) => (
          <FilterLink
            key={line}
            href={catalogHref({ ...filters, linea: line })}
            active={filters.linea === line}
            onNavigate={onNavigate}
          >
            Línea {line}
          </FilterLink>
        ))}
      </nav>

      <nav aria-label="Filtrar por varietal">
        <p className={groupTitle}>Varietal</p>
        <FilterLink
          href={catalogHref({ ...filters, varietal: undefined })}
          active={!filters.varietal}
          onNavigate={onNavigate}
        >
          Todos
        </FilterLink>
        {varietals.map((varietal) => (
          <FilterLink
            key={varietal}
            href={catalogHref({ ...filters, varietal })}
            active={filters.varietal === varietal}
            onNavigate={onNavigate}
          >
            {varietal}
          </FilterLink>
        ))}
      </nav>
    </div>
  );
}
