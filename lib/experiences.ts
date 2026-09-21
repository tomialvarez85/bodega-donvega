import { and, asc, count, eq, getTableColumns } from "drizzle-orm";

import { db } from "./db";
import { experiences, visitRequests, type Experience } from "./schema";

// Paquetes activos, del más corto/barato al más completo.
export async function getActiveExperiences(): Promise<Experience[]> {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.active, true))
    .orderBy(asc(experiences.price), asc(experiences.name));
}

export async function getActiveExperienceById(
  id: string,
): Promise<Experience | null> {
  const [row] = await db
    .select()
    .from(experiences)
    .where(and(eq(experiences.id, id), eq(experiences.active, true)))
    .limit(1);
  return row ?? null;
}

// Solicitud con su paquete: la usa la página de confirmación.
export async function getVisitRequestWithExperience(id: string) {
  const [row] = await db
    .select({
      request: visitRequests,
      experienceName: experiences.name,
    })
    .from(visitRequests)
    .innerJoin(experiences, eq(experiences.id, visitRequests.experienceId))
    .where(eq(visitRequests.id, id))
    .limit(1);
  return row ?? null;
}

// --- Admin ---

// Listado del admin: cada paquete con la cantidad de solicitudes que recibió.
export async function getAdminExperiences() {
  return db
    .select({
      ...getTableColumns(experiences),
      requests: count(visitRequests.id),
    })
    .from(experiences)
    .leftJoin(visitRequests, eq(visitRequests.experienceId, experiences.id))
    .groupBy(experiences.id)
    .orderBy(asc(experiences.name));
}

export async function getExperienceForEdit(id: string) {
  const [row] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1);
  return row ?? null;
}
