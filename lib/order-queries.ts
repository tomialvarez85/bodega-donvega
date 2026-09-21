import { and, asc, desc, eq, gte, lt } from "drizzle-orm";

import { db } from "./db";
import { startOfDay, startOfNextDay, type OrderStatus } from "./orders";
import { orderItems, orders } from "./schema";

export const ORDERS_LIMIT = 200;

type OrderFilters = {
  status?: OrderStatus;
  /** "YYYY-MM-DD", inclusive (hora de Argentina). */
  desde?: string;
  /** "YYYY-MM-DD", inclusive (hora de Argentina). */
  hasta?: string;
};

export async function listOrders({ status, desde, hasta }: OrderFilters) {
  return db
    .select()
    .from(orders)
    .where(
      and(
        status ? eq(orders.status, status) : undefined,
        desde ? gte(orders.createdAt, startOfDay(desde)) : undefined,
        hasta ? lt(orders.createdAt, startOfNextDay(hasta)) : undefined,
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(ORDERS_LIMIT);
}

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
