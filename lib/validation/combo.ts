import { z } from "zod";

import { numberFromString, requiredText } from "./product";

// Validación de combos: la usan el formulario del admin (cliente) y las Server Actions.

export const comboItemSchema = z.object({
  productId: z.uuid("Elegí un vino en cada fila"),
  quantity: z
    .number({ error: "La cantidad debe ser un número" })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1")
    .max(99, "La cantidad máxima es 99"),
});

// Las filas del selector viajan como JSON en un campo oculto llamado "items".
const itemsFromJson = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "La lista de vinos no es válida" });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(comboItemSchema)
      .min(1, "Agregá al menos un vino al combo")
      .max(30, "Un combo puede tener hasta 30 vinos distintos")
      .refine(
        (items) =>
          new Set(items.map((item) => item.productId)).size === items.length,
        "Un mismo vino no puede repetirse: subí su cantidad",
      ),
  );

export const comboSchema = z.object({
  name: requiredText("El nombre", 120),
  slug: requiredText("El slug", 120).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Solo minúsculas, números y guiones (ej. caja-descubrimiento-dv)",
  ),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción es demasiado larga (máx. 5000 caracteres)"),
  price: numberFromString("El precio")
    .pipe(
      z
        .number({ error: "El precio debe ser un número" })
        .gt(0, "El precio del combo debe ser mayor a 0")
        .max(99_999_999.99, "El precio es demasiado alto"),
    )
    .transform((value) => value.toFixed(2)),
  active: z.boolean(),
  items: itemsFromJson,
});

export type ComboInput = z.output<typeof comboSchema>;
export type ComboField = keyof ComboInput | "image";
export type ComboFieldErrors = Partial<Record<ComboField, string>>;

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export function parseComboFormData(
  formData: FormData,
):
  | { ok: true; data: ComboInput }
  | { ok: false; errors: ComboFieldErrors } {
  const result = comboSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    price: text(formData, "price"),
    active: formData.get("active") === "on",
    items: text(formData, "items") || "[]",
  });

  if (result.success) return { ok: true, data: result.data };

  const errors: ComboFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]) as ComboField;
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}
