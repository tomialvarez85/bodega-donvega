import "server-only";

// Lectura del código de error de Postgres, sin importar cuántas capas de wrapping (postgres.js,
// drizzle) le pusieron alrededor. Lo usan las Server Actions del admin y las públicas (checkout,
// newsletter) que necesitan distinguir "ya existe" de un error real.

// ¿El error de Postgres es una violación de restricción única (23505)?
export function isUniqueViolation(error: unknown) {
  return hasPgCode(error, "23505");
}

// ¿Es una violación de clave foránea? 23503 (referencia a algo que ya no existe) o 23001
// (ON DELETE RESTRICT).
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
