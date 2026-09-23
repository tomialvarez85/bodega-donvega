import "server-only";

// Utilidades compartidas por las Server Actions del admin (productos, combos y visitas).
// Los chequeos de errores de Postgres se comparten con código público (checkout, newsletter):
// viven en lib/pg-errors.ts y se re-exportan acá para no tener que tocar cada import existente.
export { isForeignKeyViolation, isUniqueViolation } from "@/lib/pg-errors";
