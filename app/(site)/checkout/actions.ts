"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { effectivePrice } from "@/lib/pricing";
import { orderItems, orders, products } from "@/lib/schema";
import {
  checkoutSchema,
  composeAddress,
  orderLinesSchema,
  type OrderLine,
} from "@/lib/validation/checkout";

// Server Actions públicas: no hay sesión de cliente. Todo lo que llega se valida de nuevo y
// el precio y el stock salen SIEMPRE de la base, nunca de lo que mande el navegador.

export type FreshCartProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; kind: "validation"; fieldErrors: Record<string, string> }
  | { ok: false; kind: "cart"; message: string; fresh: FreshCartProduct[] }
  | { ok: false; kind: "error"; message: string };

// Error de negocio dentro de la transacción: fuerza el rollback y llega al cliente como aviso.
class CartError extends Error {}

const cents = (value: string | number) => Math.round(Number(value) * 100);

/** Datos vigentes de los productos del carrito. Los inactivos o inexistentes no vuelven. */
export async function getCartSnapshot(ids: string[]): Promise<FreshCartProduct[]> {
  const parsed = z.array(z.uuid()).max(30).safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return [];

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      isOnSale: products.isOnSale,
      salePrice: products.salePrice,
      imageUrl: products.imageUrl,
      stock: products.stock,
    })
    .from(products)
    .where(and(inArray(products.id, parsed.data), eq(products.active, true)));

  // El carrito trabaja con el precio efectivo: el de oferta cuando corresponde.
  return rows.map(({ isOnSale, salePrice, ...row }) => ({
    ...row,
    price: effectivePrice({ price: row.price, isOnSale, salePrice }),
  }));
}

// Junta líneas repetidas del mismo producto.
function mergeLines(lines: OrderLine[]) {
  const merged = new Map<string, OrderLine>();
  for (const line of lines) {
    const existing = merged.get(line.productId);
    if (existing) existing.quantity += line.quantity;
    else merged.set(line.productId, { ...line });
  }
  // Orden estable por id: evita deadlocks entre pedidos simultáneos que tocan los mismos productos.
  return [...merged.values()].sort((a, b) => a.productId.localeCompare(b.productId));
}

export async function createOrder(
  values: unknown,
  rawLines: unknown,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { ok: false, kind: "validation", fieldErrors };
  }
  const data = parsed.data;

  // Honeypot: solo lo completan los bots.
  if (data.website) {
    return { ok: false, kind: "error", message: "No pudimos procesar el pedido." };
  }

  const parsedLines = orderLinesSchema.safeParse(rawLines);
  if (!parsedLines.success) {
    return { ok: false, kind: "error", message: "Tu carrito no es válido. Recargá la página." };
  }
  const lines = mergeLines(parsedLines.data);

  try {
    const orderId = await db.transaction(async (tx) => {
      const priced: { line: OrderLine; name: string; unitPrice: string }[] = [];

      for (const line of lines) {
        // Descuento atómico: solo si el producto está activo y hay stock suficiente.
        const [row] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(
            and(
              eq(products.id, line.productId),
              eq(products.active, true),
              gte(products.stock, line.quantity),
            ),
          )
          .returning({
            name: products.name,
            price: products.price,
            isOnSale: products.isOnSale,
            salePrice: products.salePrice,
          });

        if (!row) {
          const [current] = await tx
            .select({ name: products.name, stock: products.stock, active: products.active })
            .from(products)
            .where(eq(products.id, line.productId))
            .limit(1);
          if (!current || !current.active) {
            throw new CartError(`${current?.name ?? "Un producto"} ya no está disponible.`);
          }
          throw new CartError(
            current.stock <= 0
              ? `${current.name} se quedó sin stock.`
              : `Solo quedan ${current.stock} ${current.stock === 1 ? "unidad" : "unidades"} de ${current.name}.`,
          );
        }

        // Se cobra el precio efectivo (oferta incluida), siempre el de la base.
        const unitPrice = effectivePrice(row);
        if (cents(unitPrice) <= 0) {
          throw new CartError(`${row.name} todavía no tiene precio: no se puede pedir.`);
        }
        if (cents(unitPrice) !== cents(line.unitPrice)) {
          throw new CartError(`El precio de ${row.name} cambió.`);
        }
        priced.push({ line, name: row.name, unitPrice: unitPrice.toFixed(2) });
      }

      const total = priced.reduce(
        (sum, { line, unitPrice }) => sum + cents(unitPrice) * line.quantity,
        0,
      );

      const [order] = await tx
        .insert(orders)
        .values({
          status: "pendiente",
          customerName: data.fullName,
          customerEmail: data.email.toLowerCase(),
          customerPhone: data.phone,
          deliveryMethod: data.deliveryMethod,
          shippingAddress:
            data.deliveryMethod === "envio" ? composeAddress(data) : null,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          total: (total / 100).toFixed(2),
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        priced.map(({ line, name, unitPrice }) => ({
          orderId: order.id,
          productId: line.productId,
          // Copia de nombre y precio al momento de la compra.
          productName: name,
          unitPrice,
          quantity: line.quantity,
        })),
      );

      return order.id;
    });

    return { ok: true, orderId };
  } catch (error) {
    if (error instanceof CartError) {
      const fresh = await getCartSnapshot(lines.map((line) => line.productId));
      return { ok: false, kind: "cart", message: error.message, fresh };
    }
    console.error("[checkout] no se pudo crear el pedido", error);
    return {
      ok: false,
      kind: "error",
      message: "No pudimos registrar tu pedido. Probá de nuevo en un momento.",
    };
  }
}
