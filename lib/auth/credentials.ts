import "server-only";

import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export class AdminNotConfiguredError extends Error {}

export async function checkAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) {
    throw new AdminNotConfiguredError(
      "Faltan ADMIN_EMAIL o ADMIN_PASSWORD_HASH en el entorno.",
    );
  }

  // Siempre comparamos el hash, aunque el email no coincida, para que el tiempo
  // de respuesta no revele si el email es el correcto.
  const passwordOk = await bcrypt.compare(password, hash);
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail);
  return emailOk && passwordOk;
}
