"use client";

import { ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { saveProduct } from "@/app/admin/(panel)/productos/actions";
import { controlClass, Field } from "@/components/admin/form-parts";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog-params";
import type { Product } from "@/lib/schema";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import {
  PRODUCT_LINES,
  parseProductFormData,
  validateImageFile,
  type FieldErrors,
  type ProductField,
} from "@/lib/validation/product";

const FIELD_ORDER: ProductField[] = [
  "name",
  "slug",
  "varietal",
  "line",
  "category",
  "vintage",
  "price",
  "stock",
  "description",
  "salePrice",
  "saleLabel",
  "image",
];

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  // Al editar, el slug ya existe (y puede estar en links): no lo pisamos al cambiar el nombre.
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  // Los campos de oferta solo se muestran con la oferta activa (quedan en el formulario
  // igual, así el precio cargado no se pierde al apagar y volver a prender).
  const [onSale, setOnSale] = useState(product?.isOnSale ?? false);

  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const imageSrc = preview ?? product?.imageUrl ?? null;

  const invalid = (field: ProductField) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormError(null);

    // Misma validación que el servidor, para responder al instante.
    const parsed = parseProductFormData(formData);
    const clientErrors: FieldErrors = parsed.ok ? {} : { ...parsed.errors };
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const imageError = validateImageFile(file);
      if (imageError) clientErrors.image = imageError;
    } else if (!product) {
      clientErrors.image = "Subí una imagen del producto";
    }

    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field]);
    if (firstInvalid) {
      setErrors(clientErrors);
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await saveProduct(product?.id ?? null, formData);
      if (result.ok) {
        toast.success(
          product ? "Producto actualizado" : "Producto creado",
          { description: name },
        );
        router.push("/admin/productos");
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
          Datos del vino
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
            className={cn(controlClass, "h-10")}
            {...invalid("name")}
          />
        </Field>

        <Field
          id="slug"
          label="Slug (URL)"
          required
          error={errors.slug}
          hint={slug ? `/productos/${slug}` : "Se genera a partir del nombre"}
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

        <Field id="varietal" label="Varietal" required error={errors.varietal}>
          <input
            id="varietal"
            name="varietal"
            type="text"
            defaultValue={product?.varietal}
            placeholder="Malbec"
            className={cn(controlClass, "h-10")}
            {...invalid("varietal")}
          />
        </Field>

        <Field id="line" label="Línea" required error={errors.line}>
          <select
            id="line"
            name="line"
            defaultValue={product?.line ?? ""}
            className={cn(controlClass, "h-10")}
            {...invalid("line")}
          >
            <option value="" disabled>
              Elegí una línea
            </option>
            {PRODUCT_LINES.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </Field>

        <Field id="category" label="Categoría" required error={errors.category}>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? ""}
            className={cn(controlClass, "h-10")}
            {...invalid("category")}
          >
            <option value="" disabled>
              Elegí una categoría
            </option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="vintage"
          label="Añada"
          error={errors.vintage}
          hint="Opcional. Dejalo vacío si no tiene (ej. espumantes)."
        >
          <input
            id="vintage"
            name="vintage"
            type="number"
            inputMode="numeric"
            defaultValue={product?.vintage ?? ""}
            placeholder="2021"
            className={cn(controlClass, "h-10")}
            {...invalid("vintage")}
          />
        </Field>

        <Field id="price" label="Precio (ARS)" required error={errors.price}>
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={product?.price}
            className={cn(controlClass, "h-10")}
            {...invalid("price")}
          />
        </Field>

        <Field id="stock" label="Stock" required error={errors.stock}>
          <input
            id="stock"
            name="stock"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            defaultValue={product?.stock ?? 0}
            className={cn(controlClass, "h-10")}
            {...invalid("stock")}
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
            rows={6}
            defaultValue={product?.description}
            className={cn(controlClass, "py-2 leading-relaxed")}
            {...invalid("description")}
          />
        </Field>
      </section>

      <section className="border border-input bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-cream">Imagen</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-56 w-42 shrink-0 items-center justify-center border border-input bg-muted">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) o URL remota arbitraria
              <img
                src={imageSrc}
                alt={preview ? "Vista previa de la nueva imagen" : `Imagen de ${product?.name}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <ImagePlus
                aria-hidden
                className="h-8 w-8 text-stone"
                strokeWidth={1.5}
              />
            )}
          </div>

          <Field
            id="image"
            label={product ? "Reemplazar imagen" : "Subir imagen"}
            required={!product}
            error={errors.image}
            hint="JPG, PNG, WebP o AVIF, hasta 4 MB. Idealmente vertical (3:4) y con fondo liso."
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
            name="isOnSale"
            checked={onSale}
            onChange={(event) => setOnSale(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span>
            <span className="block text-sm font-medium text-cream">
              En oferta
            </span>
            <span className="block text-xs text-stone">
              Muestra el precio de oferta (con el normal tachado) en el sitio y es el que se cobra.
            </span>
          </span>
        </label>

        <div hidden={!onSale} className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            id="salePrice"
            label="Precio de oferta (ARS)"
            required
            error={errors.salePrice}
            hint="Tiene que ser menor al precio normal."
          >
            <input
              id="salePrice"
              name="salePrice"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              defaultValue={product?.salePrice ?? ""}
              className={cn(controlClass, "h-10")}
              {...invalid("salePrice")}
            />
          </Field>
          <Field
            id="saleLabel"
            label="Etiqueta"
            error={errors.saleLabel}
            hint="Opcional. Ej.: Verano 2026, Oferta de temporada, 3x2."
          >
            <input
              id="saleLabel"
              name="saleLabel"
              type="text"
              maxLength={60}
              defaultValue={product?.saleLabel ?? ""}
              className={cn(controlClass, "h-10")}
              {...invalid("saleLabel")}
            />
          </Field>
        </div>
      </section>

      <section className="border border-input bg-card p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span>
            <span className="block text-sm font-medium text-cream">
              Activo
            </span>
            <span className="block text-xs text-stone">
              Si lo desmarcás, el vino se oculta del catálogo pero no se borra.
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
          {pending
            ? "Guardando…"
            : product
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
        <Link
          href="/admin/productos"
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
