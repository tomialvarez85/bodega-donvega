import { z } from "zod";

import { CATEGORIES, LINES } from "@/lib/catalog-params";

// Sin imports de servidor: lo usan el formulario (cliente) y las Server Actions.

// Las dos líneas de producto de la bodega.
export const PRODUCT_LINES = LINES;

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} es demasiado largo (máx. ${max} caracteres)`);

// Acepta coma decimal ("8900,50") y devuelve number (NaN si no es numérico).
export const numberFromString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .transform((value) => Number(value.replace(",", ".")));

const maxVintage = new Date().getFullYear() + 1;

export const productSchema = z
  .object({
  name: requiredText("El nombre", 120),
  slug: requiredText("El slug", 120).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Solo minúsculas, números y guiones (ej. don-vega-reserva-malbec)",
  ),
  varietal: requiredText("El varietal", 120),
  line: z.enum(PRODUCT_LINES, { error: "Elegí una línea" }),
  category: z.enum(CATEGORIES, { error: "Elegí una categoría" }),
  vintage: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(
      z
        .number({ error: "La añada debe ser un año válido" })
        .int("La añada debe ser un año válido")
        .min(1900, "La añada debe ser un año válido")
        .max(maxVintage, `La añada no puede ser posterior a ${maxVintage}`)
        .nullable(),
    ),
  price: numberFromString("El precio")
    .pipe(
      z
        .number({ error: "El precio debe ser un número" })
        .min(0, "El precio no puede ser negativo")
        .max(99_999_999.99, "El precio es demasiado alto"),
    )
    .transform((value) => value.toFixed(2)),
  stock: numberFromString("El stock").pipe(
    z
      .number({ error: "El stock debe ser un número" })
      .int("El stock debe ser un número entero")
      .min(0, "El stock no puede ser negativo")
      .max(1_000_000, "El stock es demasiado alto"),
  ),
  // Opcional: los vinos cargados por seed no la traen hasta que se escriba la bajada comercial.
  description: z
    .string()
    .trim()
    .max(5000, "La descripción es demasiado larga (máx. 5000 caracteres)"),
  active: z.boolean(),

  // Promoción: el precio de oferta solo se exige (y se controla) si `isOnSale` está activo.
  isOnSale: z.boolean(),
  salePrice: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value.replace(",", ".")))),
  saleLabel: z
    .string()
    .trim()
    .max(60, "La etiqueta es demasiado larga (máx. 60 caracteres)"),
  })
  .superRefine((data, ctx) => {
    if (!data.isOnSale) return;
    const fail = (message: string) =>
      ctx.addIssue({ code: "custom", path: ["salePrice"], message });
    const regular = Number(data.price);

    if (data.salePrice === null) return fail("Ingresá el precio de oferta");
    if (Number.isNaN(data.salePrice) || data.salePrice <= 0) {
      return fail("El precio de oferta debe ser un número mayor a 0");
    }
    if (regular <= 0) return fail("Cargá primero el precio normal del vino");
    if (data.salePrice >= regular) {
      return fail(
        `El precio de oferta tiene que ser menor al precio normal ($ ${regular.toLocaleString("es-AR")})`,
      );
    }
  })
  .transform((data) => ({
    ...data,
    // Se conserva el precio si es válido aunque la oferta esté apagada (para reactivarla).
    salePrice:
      data.salePrice === null || Number.isNaN(data.salePrice) || data.salePrice <= 0
        ? null
        : data.salePrice.toFixed(2),
    saleLabel: data.saleLabel || null,
  }));

export type ProductInput = z.output<typeof productSchema>;
export type ProductField = keyof ProductInput | "image";
export type FieldErrors = Partial<Record<ProductField, string>>;

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export function parseProductFormData(
  formData: FormData,
):
  | { ok: true; data: ProductInput }
  | { ok: false; errors: FieldErrors } {
  const result = productSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    varietal: text(formData, "varietal"),
    line: text(formData, "line"),
    category: text(formData, "category"),
    vintage: text(formData, "vintage"),
    price: text(formData, "price"),
    stock: text(formData, "stock"),
    description: text(formData, "description"),
    active: formData.get("active") === "on",
    isOnSale: formData.get("isOnSale") === "on",
    salePrice: text(formData, "salePrice"),
    saleLabel: text(formData, "saleLabel"),
  });

  if (result.success) return { ok: true, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]) as ProductField;
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

export function validateImageFile(file: File): string | null {
  if (!(file.type in IMAGE_TYPES)) return "Usá una imagen JPG, PNG, WebP o AVIF";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen no puede superar los 4 MB";
  return null;
}

export const isUuid = (value: string) => z.uuid().safeParse(value).success;
