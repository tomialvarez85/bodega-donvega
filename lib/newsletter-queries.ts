import { desc, eq, ilike } from "drizzle-orm";

import { db } from "./db";
import { newsletterSubscribers } from "./schema";

// Escapa los comodines de LIKE para que el texto del admin se busque literal.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export const NEWSLETTER_SUBSCRIBERS_LIMIT = 500;

// Listado del admin: el más reciente primero, con buscador opcional por email.
export async function getAdminNewsletterSubscribers(q?: string) {
  return db
    .select()
    .from(newsletterSubscribers)
    .where(q ? ilike(newsletterSubscribers.email, `%${escapeLike(q)}%`) : undefined)
    .orderBy(desc(newsletterSubscribers.subscribedAt))
    .limit(NEWSLETTER_SUBSCRIBERS_LIMIT);
}

// Para el CSV: todos los suscriptores activos, sin límite (es una exportación completa, no un
// listado paginado).
export async function getActiveNewsletterSubscribersForExport() {
  return db
    .select({
      email: newsletterSubscribers.email,
      subscribedAt: newsletterSubscribers.subscribedAt,
    })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.active, true))
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}
