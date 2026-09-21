"use client";

import { ImagePlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { saveCombo } from "@/app/admin/(panel)/combos/actions";
import { controlClass, Field } from "@/components/admin/form-parts";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { Combo } from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  parseComboFormData,
  type ComboField,
  type ComboFieldErrors,
} from "@/lib/validation/combo";
import { validateImageFile } from "@/lib/validation/product";

// Vino elegible para el combo, con el precio vigente ya resuelto (oferta incluida).
export type ComboProductOption = {
  id: string;
  name: string;
  line: string;
  vintage: number | null;
  active: boolean;
  price: number;
};

type Row = { key: string; productId: string; quantity: string };

const FIELD_ORDER: ComboField[] = [
  "name",
  "slug",
  "price",
  "description",
  "items",
  "image",
];

let rowCounter = 0;
const newRow = (productId = "", quantity = "1"): Row => ({
  key: `row-${++rowCounter}`,
  productId,
  quantity,
});

const optionLabel = (product: ComboProductOption) =>
  `${product.name} — ${product.line}${product.vintage ? ` ${product.vintage}` : ""}${product.active ? "" : " (inactivo)"}`;

export function ComboForm({
  combo,
  initialItems,
  products,
}: {
  combo?: Combo;
  initialItems?: { productId: string; quantity: number }[];
  products: ComboProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ComboFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState(combo?.name ?? "");
  const [slug, setSlug] = useState(combo?.slug ?? "");
  // Al editar, el slug ya existe (y puede estar en links): no lo pisamos al cambiar el nombre.
  const [slugTouched, setSlugTouched] = useState(Boolean(combo));
  const [price, setPrice] = useState(combo?.price ?? "");
  const [rows, setRows] = useState<Row[]>(() =>
    initialItems && initialItems.length > 0
      ? initialItems.map((item) => newRow(item.productId, String(item.quantity)))
      : [newRow()],
  );

  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  const imageSrc = preview ?? combo?.imageUrl ?? null;

  const byId = new Map(products.map((product) => [product.id, product]));
  const chosen = new Set(rows.map((row) => row.productId).filter(Boolean));
  const bottles = rows.reduce(
    (sum, row) => sum + (row.productId ? Math.max(parseInt(row.quantity, 10) || 0, 0) : 0),
    0,
  );
  const allPriced = rows.every(
    (row) => !row.productId || (byId.get(row.productId)?.price ?? 0) > 0,
  );
  const separate = rows.reduce(
    (sum, row) =>
      sum +
      (byId.get(row.productId)?.price ?? 0) *
        Math.max(parseInt(row.quantity, 10) || 0, 0),
    0,
  );
  const comboPrice = Number(String(price).replace(",", "."));

  const invalid = (field: ComboField) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormError(null);

    // Misma validación que el servidor, para responder al instante.
    const parsed = parseComboFormData(formData);
    const clientErrors: ComboFieldErrors = parsed.ok ? {} : { ...parsed.errors };
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const imageError = validateImageFile(file);
      if (imageError) clientErrors.image = imageError;
    } else if (!combo) {
      clientErrors.image = "Subí una imagen del combo";
    }

    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field]);
    if (firstInvalid) {
      setErrors(clientErrors);
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await saveCombo(combo?.id ?? null, formData);
      if (result.ok) {
        toast.success(combo ? "Combo actualizado" : "Combo creado", {
          description: name,
        });
        router.push("/admin/combos");
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(
        result.message ??
          (result.fieldErrors ? "Revisá los campos marcados." : null),
      );
      const first = FIELD_ORDER.find((field) => result.fieldErrors?.[field]);
      if (first) document.getElementById(first)?.focus();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      {formError && (
        <p
          role="alert"
          className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {formError}
        </p>
      )}

      <section className="grid gap-5 border border-input bg-card p-5 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-cream sm:col-span-2">
          Datos del combo
        </h2>

        <Field id="name" label="Nombre" required error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Caja Descubrimiento DV"
            className={cn(controlClass, "h-10")}
            {...invalid("name")}
          />
        </Field>

        <Field
          id="slug"
          label="Slug (para enlazar)"
          required
          error={errors.slug}
          hint={slug ? `/promociones#${slug}` : "Se genera a partir del nombre"}
        >
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={cn(controlClass, "h-10 font-mono")}
            {...invalid("slug")}
          />
        </Field>

        <Field
          id="price"
          label="Precio del combo (ARS)"
          required
          error={errors.price}
          hint="Es lo que se cobra por el combo completo."
        >
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={cn(controlClass, "h-10")}
            {...invalid("price")}
          />
        </Field>

        <Field
          id="description"
          label="Descripción"
          error={errors.description}
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={combo?.description}
            className={cn(controlClass, "py-2 leading-relaxed")}
            {...invalid("description")}
          />
        </Field>
      </section>

      <section
        id="items"
        tabIndex={-1}
        aria-labelledby="items-title"
        className="border border-input bg-card p-5 outline-none"
      >
        <h2 id="items-title" className="mb-1 text-sm font-semibold text-cream">
          Vinos incluidos
        </h2>
        <p className="mb-4 text-xs text-stone">
          Elegí los vinos del combo y cuántas botellas de cada uno.
        </p>

        <ul className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <li key={row.key} className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                <label
                  htmlFor={`item-product-${row.key}`}
                  className="text-xs font-medium text-sand"
                >
                  Vino {index + 1}
                </label>
                <select
                  id={`item-product-${row.key}`}
                  value={row.productId}
                  onChange={(event) =>
                    updateRow(row.key, { productId: event.target.value })
                  }
                  className={cn(controlClass, "h-10")}
                >
                  <option value="">Elegí un vino…</option>
                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      // Cada vino va una sola vez: los ya elegidos en otras filas se deshabilitan.
                      disabled={chosen.has(product.id) && product.id !== row.productId}
                    >
                      {optionLabel(product)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-24 flex-col gap-1.5">
                <label
                  htmlFor={`item-qty-${row.key}`}
                  className="text-xs font-medium text-sand"
                >
                  Cantidad
                </label>
                <input
                  id={`item-qty-${row.key}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  step={1}
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(row.key, { quantity: event.target.value })
                  }
                  className={cn(controlClass, "h-10")}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Quitar el vino ${index + 1} del combo`}
                disabled={rows.length === 1}
                onClick={() =>
                  setRows((current) => current.filter((r) => r.key !== row.key))
                }
                className="h-10 w-10 border-input bg-card text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>

        {errors.items && (
          <p id="items-error" role="alert" className="mt-3 text-xs font-medium text-red-300">
            {errors.items}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((current) => [...current, newRow()])}
            disabled={chosen.size >= products.length}
            className="h-10 gap-2 border-input bg-card px-4"
          >
            <Plus aria-hidden />
            Agregar vino
          </Button>

          <p className="text-xs text-stone" aria-live="polite">
            {bottles} {bottles === 1 ? "botella" : "botellas"}
            {allPriced && separate > 0 && (
              <>
                {" · por separado suman "}
                <span className="text-sand">{formatPrice(separate)}</span>
                {comboPrice > 0 && comboPrice >= separate && (
                  <span className="text-amber-300">
                    {" "}
                    (el combo no rebaja el precio)
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Las filas viajan al servidor como JSON. */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            rows.map((row) => ({
              productId: row.productId,
              quantity: Number(row.quantity),
            })),
          )}
        />
      </section>

      <section className="border border-input bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-cream">Imagen</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-44 w-56 shrink-0 items-center justify-center border border-input bg-muted">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) o URL remota arbitraria
              <img
                src={imageSrc}
                alt={preview ? "Vista previa de la nueva imagen" : `Imagen de ${combo?.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus aria-hidden className="h-8 w-8 text-stone" strokeWidth={1.5} />
            )}
          </div>

          <Field
            id="image"
            label={combo ? "Reemplazar imagen" : "Subir imagen"}
            required={!combo}
            error={errors.image}
            hint="JPG, PNG, WebP o AVIF, hasta 4 MB. Se muestra en formato 4:3."
            className="flex-1"
          >
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
              className={cn(
                controlClass,
                "cursor-pointer py-1.5 text-sand file:mr-3 file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cream hover:file:bg-hairline-mid",
              )}
              {...invalid("image")}
            />
          </Field>
        </div>
      </section>

      <section className="border border-input bg-card p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="active"
            defaultChecked={combo?.active ?? true}
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span>
            <span className="block text-sm font-medium text-cream">Activo</span>
            <span className="block text-xs text-stone">
              Si lo desmarcás, el combo se oculta de Promociones pero no se borra.
            </span>
          </span>
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-10 bg-cream px-6 text-sm font-medium text-ink transition-colors hover:bg-cream/90 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        >
          {pending ? "Guardando…" : combo ? "Guardar cambios" : "Crear combo"}
        </button>
        <Link
          href="/admin/combos"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 border-input bg-card px-5 text-sm",
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
