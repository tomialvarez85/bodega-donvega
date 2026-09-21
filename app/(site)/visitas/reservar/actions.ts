"use server";

import { db } from "@/lib/db";
import { getActiveExperienceById } from "@/lib/experiences";
import { visitRequests } from "@/lib/schema";
import {
  groupSizeExceededMessage,
  visitRequestSchema,
} from "@/lib/validation/visit";

// Server Action pública: no hay sesión de cliente. Todo se valida de nuevo acá.

export type CreateVisitRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; kind: "validation"; fieldErrors: Record<string, string> }
  | { ok: false; kind: "error"; message: string };

export async function createVisitRequest(
  values: unknown,
): Promise<CreateVisitRequestResult> {
  const parsed = visitRequestSchema.safeParse(values);
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
    return {
      ok: false,
      kind: "error",
      message: "No pudimos procesar la solicitud.",
    };
  }

  try {
    const experience = await getActiveExperienceById(data.experienceId);
    if (!experience) {
      return {
        ok: false,
        kind: "validation",
        fieldErrors: { experienceId: "Ese paquete ya no está disponible." },
      };
    }
    if (experience.maxGroupSize && data.groupSize > experience.maxGroupSize) {
      return {
        ok: false,
        kind: "validation",
        fieldErrors: {
          groupSize: groupSizeExceededMessage(experience.maxGroupSize),
        },
      };
    }

    const [request] = await db
      .insert(visitRequests)
      .values({
        experienceId: experience.id,
        customerName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase(),
        preferredDate: data.preferredDate,
        groupSize: data.groupSize,
        comments: data.comments || null,
        status: "pendiente",
      })
      .returning({ id: visitRequests.id });

    return { ok: true, requestId: request.id };
  } catch (error) {
    console.error("[visitas] no se pudo crear la solicitud", error);
    return {
      ok: false,
      kind: "error",
      message: "No pudimos registrar tu solicitud. Probá de nuevo en un momento.",
    };
  }
}
