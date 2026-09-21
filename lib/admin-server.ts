import "server-only";

import { del } from "@vercel/blob";

// Utilidades compartidas por las Server Actions del admin (productos y combos).

const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

// Borra la imagen del Blob si es nuestra (no las de picsum ni las de /public). Falla en silencio.
export async function deleteBlobQuietly(url: string) {
  if (!isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error("[admin] no se pudo borrar el blob", url, error);
  }
}

// ¿El error de Postgres es una violación de restricción única (23505)?
export function isUniqueViolation(error: unknown) {
  return hasPgCode(error, "23505");
}

// ¿Es una violación de clave foránea? 23503 (referencia a un vino que ya no existe) o 23001
// (ON DELETE RESTRICT: borrar un vino que está en un combo).
export function isForeignKeyViolation(error: unknown) {
  return hasPgCode(error, "23503") || hasPgCode(error, "23001");
}

function hasPgCode(error: unknown, code: string) {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth++) {
    if ((current as { code?: string }).code === code) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
