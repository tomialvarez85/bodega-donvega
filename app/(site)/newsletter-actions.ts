"use server";

import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/pg-errors";
import { newsletterSubscribers } from "@/lib/schema";
import { newsletterSchema } from "@/lib/validation/newsletter";

// Server Action pública: solo guarda el email en newsletter_subscribers. No manda ningún mail;
// la lista se exporta después a mano para usarla en la herramienta de email marketing que se
// elija. Se usa desde el footer (todas las páginas) y desde la sección propia del Home.

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; kind: "validation"; message: string }
  | { ok: false; kind: "error"; message: string };

export async function subscribeToNewsletter(
  values: unknown,
): Promise<SubscribeResult> {
  const parsed = newsletterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "validation",
      message: parsed.error.issues[0]?.message ?? "Ingresá un email válido",
    };
  }

  try {
    const rows = await db
      .insert(newsletterSubscribers)
      .values({ email: parsed.data.email.toLowerCase() })
      .onConflictDoNothing({ target: newsletterSubscribers.email })
      .returning({ id: newsletterSubscribers.id });

    // onConflictDoNothing no lanza: si no insertó nada es porque el email ya estaba.
    return { ok: true, alreadySubscribed: rows.length === 0 };
  } catch (error) {
    // Por si el conflicto llega como excepción (por ejemplo, un índice distinto al esperado).
    if (isUniqueViolation(error)) {
      return { ok: true, alreadySubscribed: true };
    }
    console.error("[newsletter] no se pudo guardar la suscripción", error);
    return {
      ok: false,
      kind: "error",
      message: "No pudimos guardar tu suscripción. Probá de nuevo en un momento.",
    };
  }
}
