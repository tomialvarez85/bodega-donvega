import { asc, count, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "./db";
import { effectivePrice } from "./pricing";
import { comboItems, combos, products } from "./schema";

// Listado del admin: cada combo con la cantidad de vinos distintos y de botellas.
export async function getAdminCombos() {
  return db
    .select({
      ...getTableColumns(combos),
      lines: count(comboItems.id),
      bottles: sql<number>`coalesce(sum(${comboItems.quantity}), 0)::int`,
    })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .groupBy(combos.id)
    .orderBy(asc(combos.name));
}

export async function getComboForEdit(id: string) {
  const [combo] = await db.select().from(combos).where(eq(combos.id, id)).limit(1);
  if (!combo) return null;

  const items = await db
    .select({ productId: comboItems.productId, quantity: comboItems.quantity })
    .from(comboItems)
    .where(eq(comboItems.comboId, id));

  return { combo, items };
}

// Vinos que se pueden meter en un combo (todos, activos o no), con su precio vigente.
export async function getComboProductOptions() {
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.name));

  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    line: product.line,
    vintage: product.vintage,
    active: product.active,
    price: effectivePrice(product),
  }));
}
