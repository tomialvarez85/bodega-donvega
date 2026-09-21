import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";

import { db } from "./db";
import { effectivePrice } from "./pricing";
import { combos, comboItems, products, type Combo, type Product } from "./schema";

export type ComboLine = {
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  varietal: string;
  /** Si el vino ya no está activo no tiene página en el catálogo. */
  active: boolean;
};

export type ComboWithItems = Combo & {
  items: ComboLine[];
  bottles: number;
  /** Lo que costarían las botellas por separado (con sus ofertas); null si algún vino no tiene precio. */
  separatePrice: number | null;
};

export type Promotions = {
  onSale: Product[];
  combos: ComboWithItems[];
};

// Promociones vigentes: vinos activos en oferta y combos activos con su contenido.
export async function getPromotions(): Promise<Promotions> {
  const [onSale, comboRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(
        and(
          eq(products.active, true),
          eq(products.isOnSale, true),
          isNotNull(products.salePrice),
        ),
      )
      .orderBy(asc(products.createdAt), asc(products.name)),
    db
      .select()
      .from(combos)
      .where(eq(combos.active, true))
      .orderBy(asc(combos.createdAt), asc(combos.name)),
  ]);

  if (comboRows.length === 0) return { onSale, combos: [] };

  const lines = await db
    .select({
      comboId: comboItems.comboId,
      quantity: comboItems.quantity,
      product: products,
    })
    .from(comboItems)
    .innerJoin(products, eq(products.id, comboItems.productId))
    .where(
      inArray(
        comboItems.comboId,
        comboRows.map((combo) => combo.id),
      ),
    )
    .orderBy(asc(products.name));

  return {
    onSale,
    combos: comboRows.map((combo) => {
      const own = lines.filter((line) => line.comboId === combo.id);
      const prices = own.map((line) => effectivePrice(line.product));
      return {
        ...combo,
        items: own.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
          name: product.name,
          slug: product.slug,
          varietal: product.varietal,
          active: product.active,
        })),
        bottles: own.reduce((sum, line) => sum + line.quantity, 0),
        separatePrice: prices.every((price) => price > 0)
          ? own.reduce(
              (sum, line, index) => sum + prices[index] * line.quantity,
              0,
            )
          : null,
      };
    }),
  };
}
