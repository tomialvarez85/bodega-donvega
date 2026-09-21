// Parámetros del catálogo (?linea=&varietal=&q=&orden=&categoria=). Sin imports de DB:
// lo usan tanto el servidor como los componentes cliente de filtros.

export const CATEGORIES = ["Tinto", "Blanco", "Rosado", "Espumante"] as const;
export type Category = (typeof CATEGORIES)[number];

// Las dos líneas de producto de la bodega.
export const LINES = ["DV", "ADN"] as const;
export type Line = (typeof LINES)[number];

// El diseño del catálogo no tiene selector de orden: por defecto va el orden de la colección.
// Los demás valores siguen funcionando por URL (?orden=nombre, precio-asc, precio-desc).
export const SORT_OPTIONS = [
  { value: "coleccion", label: "Orden de la colección" },
  { value: "nombre", label: "Nombre (A–Z)" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "coleccion";

export type CatalogFilters = {
  categoria?: Category;
  linea?: Line;
  varietal?: string;
  orden: SortValue;
  q?: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export function parseCatalogParams(raw: RawParams): CatalogFilters {
  const categoria = CATEGORIES.find(
    (c) => c.toLowerCase() === first(raw.categoria)?.toLowerCase(),
  );
  const linea = LINES.find(
    (l) => l.toLowerCase() === first(raw.linea)?.toLowerCase(),
  );
  const orden =
    SORT_OPTIONS.find((o) => o.value === first(raw.orden))?.value ??
    DEFAULT_SORT;

  return {
    categoria,
    linea,
    varietal: first(raw.varietal),
    orden,
    q: first(raw.q),
  };
}

type HrefInput = {
  categoria?: string;
  linea?: string;
  varietal?: string;
  orden?: string;
  q?: string;
};

export function catalogHref(filters: HrefInput = {}) {
  const params = new URLSearchParams();
  const q = filters.q?.trim();

  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.linea) params.set("linea", filters.linea);
  if (filters.varietal) params.set("varietal", filters.varietal);
  if (filters.orden && filters.orden !== DEFAULT_SORT) {
    params.set("orden", filters.orden);
  }
  if (q) params.set("q", q);

  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}
