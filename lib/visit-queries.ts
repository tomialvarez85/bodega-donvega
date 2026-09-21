import { desc, eq } from "drizzle-orm";

import { db } from "./db";
import { experiences, visitRequests } from "./schema";
import type { VisitRequestStatus } from "./visits";

export const VISIT_REQUESTS_LIMIT = 200;

// Solicitudes con el nombre de su paquete, la más reciente primero.
export async function listVisitRequests(status?: VisitRequestStatus) {
  return db
    .select({
      request: visitRequests,
      experienceName: experiences.name,
    })
    .from(visitRequests)
    .innerJoin(experiences, eq(experiences.id, visitRequests.experienceId))
    .where(status ? eq(visitRequests.status, status) : undefined)
    .orderBy(desc(visitRequests.createdAt))
    .limit(VISIT_REQUESTS_LIMIT);
}

export async function getVisitRequestDetail(id: string) {
  const [row] = await db
    .select({
      request: visitRequests,
      experienceId: experiences.id,
      experienceName: experiences.name,
    })
    .from(visitRequests)
    .innerJoin(experiences, eq(experiences.id, visitRequests.experienceId))
    .where(eq(visitRequests.id, id))
    .limit(1);
  return row ?? null;
}
