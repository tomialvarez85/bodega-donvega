import "server-only";

// Utilidades compartidas por las Server Actions del admin (productos, combos y visitas).

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
