"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { catalogHref, type CatalogFilters } from "@/lib/catalog-params";

// Buscador del catálogo (nombre o varietal). Filtra por URL (?q=) con 400 ms de espera,
// o al instante con Enter. Conserva los demás filtros.
export function CatalogSearch({ filters }: { filters: CatalogFilters }) {
  const router = useRouter();
  const urlQuery = filters.q ?? "";

  const [value, setValue] = useState(urlQuery);
  // Último valor que enviamos a la URL, para distinguir nuestros cambios de los externos
  // (chips "quitar filtro", "Limpiar todo").
  const [sent, setSent] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);

  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery !== sent) {
      setValue(urlQuery);
      setSent(urlQuery);
    }
  }

  function push(next: string) {
    setSent(next);
    router.replace(catalogHref({ ...filters, q: next }), { scroll: false });
  }

  useEffect(() => {
    if (value.trim() === sent.trim()) return;
    const timer = setTimeout(() => {
      setSent(value);
      router.replace(catalogHref({ ...filters, q: value }), { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [value, sent, filters, router]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        push(value);
      }}
      className="flex min-w-[220px] flex-none items-center gap-2.5 border-b-[0.5px] border-hairline-mid pb-2 focus-within:border-gold"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="6.5" cy="6.5" r="5.5" stroke="#b09e8a" strokeWidth="0.75" />
        <line x1="11" y1="11" x2="15" y2="15" stroke="#b09e8a" strokeWidth="0.75" />
      </svg>
      <input
        type="text"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar varietal o nombre…"
        aria-label="Buscar vinos"
        autoComplete="off"
        className="w-[200px] bg-transparent text-[13px] text-cream outline-none placeholder:text-sand"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            push("");
          }}
          aria-label="Limpiar búsqueda"
          className="p-1"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="9" y2="9" stroke="#b09e8a" strokeWidth="0.75" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="#b09e8a" strokeWidth="0.75" />
          </svg>
        </button>
      )}
    </form>
  );
}
