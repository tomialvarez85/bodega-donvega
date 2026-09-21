"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  canTransition,
  isOrderStatus,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders";
import { orders } from "@/lib/schema";
import { isUuid } from "@/lib/validation/product";

export type UpdateStatusResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; message: string };

// Endpoint público como toda Server Action: re-verifica la sesión.
export async function updateOrderStatus(
  id: string,
  nextStatus: string,
): Promise<UpdateStatusResult> {
  await requireAdmin();

  if (!isUuid(id) || !isOrderStatus(nextStatus)) {
    return { ok: false, message: "Datos inválidos." };
  }

  const [order] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) return { ok: false, message: "Este pedido ya no existe." };

  if (!canTransition(order.status, nextStatus)) {
    return {
      ok: false,
      message: `No se puede pasar de «${STATUS_LABELS[order.status]}» a «${STATUS_LABELS[nextStatus]}».`,
    };
  }

  // El WHERE incluye el estado leído: si otra pestaña lo cambió en el medio, no pisa.
  const updated = await db
    .update(orders)
    .set({ status: nextStatus })
    .where(and(eq(orders.id, id), eq(orders.status, order.status)))
    .returning({ id: orders.id });
  if (updated.length === 0) {
    return {
      ok: false,
      message: "El estado cambió mientras tanto. Recargá la página.",
    };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return { ok: true, status: nextStatus };
}
