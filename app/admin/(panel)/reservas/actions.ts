"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { visitRequests } from "@/lib/schema";
import { isUuid } from "@/lib/validation/product";
import {
  canTransitionVisit,
  isVisitRequestStatus,
  VISIT_STATUS_LABELS,
  type VisitRequestStatus,
} from "@/lib/visits";

export type UpdateVisitStatusResult =
  | { ok: true; status: VisitRequestStatus }
  | { ok: false; message: string };

// Endpoint público como toda Server Action: re-verifica la sesión.
export async function updateVisitRequestStatus(
  id: string,
  nextStatus: string,
): Promise<UpdateVisitStatusResult> {
  await requireAdmin();

  if (!isUuid(id) || !isVisitRequestStatus(nextStatus)) {
    return { ok: false, message: "Datos inválidos." };
  }

  const [request] = await db
    .select({ status: visitRequests.status })
    .from(visitRequests)
    .where(eq(visitRequests.id, id))
    .limit(1);
  if (!request) return { ok: false, message: "Esta solicitud ya no existe." };

  if (!canTransitionVisit(request.status, nextStatus)) {
    return {
      ok: false,
      message: `No se puede pasar de «${VISIT_STATUS_LABELS[request.status]}» a «${VISIT_STATUS_LABELS[nextStatus]}».`,
    };
  }

  // El WHERE incluye el estado leído: si otra pestaña lo cambió en el medio, no pisa.
  const updated = await db
    .update(visitRequests)
    .set({ status: nextStatus })
    .where(and(eq(visitRequests.id, id), eq(visitRequests.status, request.status)))
    .returning({ id: visitRequests.id });
  if (updated.length === 0) {
    return {
      ok: false,
      message: "El estado cambió mientras tanto. Recargá la página.",
    };
  }

  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${id}`);
  return { ok: true, status: nextStatus };
}
