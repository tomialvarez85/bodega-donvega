import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { cache } from "react";

import type { CatalogFilters } from "./catalog-params";
import { db } from "./db";
import { products, type Product } from "./schema";

// Escapa los comodines de LIKE para que el texto del usuario se busque literal.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export async function getCatalogProducts({
  categoria,
  linea,
  varietal,
  orden,
  q,
}: CatalogFilters) {
  const orderBy =
    orden === "precio-asc"
      ? [asc(products.price), asc(products.name)]
      : orden === "precio-desc"
        ? [desc(products.price), asc(products.name)]
        : orden === "nombre"
          ? [asc(products.name)]
          : // Orden de la colección: el de carga (los DV primero, como en el seed).
            [asc(products.createdAt), asc(products.name)];

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        categoria ? eq(products.category, categoria) : undefined,
        linea ? eq(products.line, linea) : undefined,
        // Los blends guardan varios varietales en un mismo texto: buscamos por contenido.
        varietal
          ? ilike(products.varietal, `%${escapeLike(varietal)}%`)
          : undefined,
        // El buscador mira nombre y varietal.
        q
          ? or(
              ilike(products.name, `%${escapeLike(q)}%`),
              ilike(products.varietal, `%${escapeLike(q)}%`),
            )
          : undefined,
      ),
    )
    .orderBy(...orderBy);
}

// Uvas individuales presentes en el catálogo activo. "Malbec, Cabernet Sauvignon
// y Petit Verdot" aporta tres opciones, no una.
export async function getCatalogVarietals() {
  const rows = await db
    .selectDistinct({ varietal: products.varietal })
    .from(products)
    .where(eq(products.active, true));

  const grapes = new Set(
    rows.flatMap(({ varietal }) =>
      varietal
        .split(/\s*,\s*|\s+y\s+/)
        .map((grape) => grape.trim())
        .filter(Boolean),
    ),
  );

  return [...grapes].sort((a, b) => a.localeCompare(b, "es"));
}

// Cantidad de vinos activos del catálogo (para el stat "Varietales únicos" del Home).
export async function getActiveProductCount() {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.active, true));

  return Number(rows[0]?.count ?? 0);
}

// Cacheado por request: lo usan generateMetadata y la página sin duplicar la query.
export const getProductBySlug = cache(async (slug: string) => {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return product ?? null;
});

// Misma categoría, sin el actual. Primero los de la misma línea (DV / ADN) y, dentro de
// cada grupo, los de precio más cercano.
export async function getRelatedProducts(
  product: Pick<Product, "id" | "category" | "price" | "line">,
  limit = 3,
) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        eq(products.category, product.category),
        ne(products.id, product.id),
      ),
    )
    .orderBy(
      desc(sql`(${products.line} = ${product.line})`),
      sql`abs(${products.price} - ${product.price}::numeric)`,
      asc(products.name),
    )
    .limit(limit);
}

// Todos los productos (activos e inactivos) para el admin, con búsqueda por nombre.
export async function getAdminProducts(q?: string) {
  return db
    .select()
    .from(products)
    .where(q ? ilike(products.name, `%${escapeLike(q)}%`) : undefined)
    .orderBy(asc(products.name));
}

// Vinos destacados del Home: primero el nuevo lanzamiento y luego los de mayor puntaje.
export async function getFeaturedProducts(limit = 3) {
  const topPoints = sql`coalesce((select max((award->>'points')::int) from jsonb_array_elements(${products.awards}) as award), 0)`;

  return db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.isNewRelease), desc(topPoints), asc(products.name))
    .limit(limit);
}
