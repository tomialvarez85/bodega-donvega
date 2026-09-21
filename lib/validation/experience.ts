import { z } from "zod";

import { PRICE_UNITS } from "@/lib/visits";

import { numberFromString, requiredText } from "./product";

// Validación de paquetes de visita: la usan el formulario del admin (cliente) y las Server Actions.

const optionalInt = (label: string, max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .pipe(
      z
        .number({ error: `${label} debe ser un número` })
        .int(`${label} debe ser un número entero`)
        .min(1, `${label} debe ser al menos 1`)
        .max(max, `${label} es demasiado alto`)
        .nullable(),
    );

export const experienceSchema = z.object({
  name: requiredText("El nombre", 120),
  slug: requiredText("El slug", 120).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Solo minúsculas, números y guiones (ej. cata-premium)",
  ),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción es demasiado larga (máx. 5000 caracteres)"),
  durationMinutes: z
    .string()
    .trim()
    .min(1, "La duración es obligatoria")
    .transform((value) => Number(value.replace(",", ".")))
    .pipe(
      z
        .number({ error: "La duración debe ser un número" })
        .int("La duración debe ser un número entero de minutos")
        .min(1, "La duración debe ser al menos 1 minuto")
        .max(1440, "La duración no puede superar las 24 horas (1440 min)"),
    ),
  // 0 se permite: la página pública muestra "Precio a consultar".
  price: numberFromString("El precio")
    .pipe(
      z
        .number({ error: "El precio debe ser un número" })
        .min(0, "El precio no puede ser negativo")
        .max(99_999_999.99, "El precio es demasiado alto"),
    )
    .transform((value) => value.toFixed(2)),
  priceUnit: z.enum(PRICE_UNITS, { error: "Elegí si el precio es por persona o por grupo" }),
  // Vacío = sin tope definido.
  maxGroupSize: optionalInt("La capacidad máxima", 500),
  active: z.boolean(),
});

export type ExperienceInput = z.output<typeof experienceSchema>;
export type ExperienceField = keyof ExperienceInput | "image";
export type ExperienceFieldErrors = Partial<Record<ExperienceField, string>>;

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export function parseExperienceFormData(
  formData: FormData,
):
  | { ok: true; data: ExperienceInput }
  | { ok: false; errors: ExperienceFieldErrors } {
  const result = experienceSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    durationMinutes: text(formData, "durationMinutes"),
    price: text(formData, "price"),
    priceUnit: text(formData, "priceUnit"),
    maxGroupSize: text(formData, "maxGroupSize"),
    active: formData.get("active") === "on",
  });

  if (result.success) return { ok: true, data: result.data };

  const errors: ExperienceFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]) as ExperienceField;
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}
