import { asc, eq } from "drizzle-orm";

import { db } from "./db";
import { orderItems, orders } from "./schema";

export async function getOrderWithItems(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.productName));

  return { order, items };
}
