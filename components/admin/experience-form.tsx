"use client";

import { ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { saveExperience } from "@/app/admin/(panel)/visitas/actions";
import { controlClass, Field } from "@/components/admin/form-parts";
import { buttonVariants } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import type { Experience } from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  parseExperienceFormData,
  type ExperienceField,
  type ExperienceFieldErrors,
} from "@/lib/validation/experience";
import { validateImageFile } from "@/lib/validation/product";
import { PRICE_UNITS } from "@/lib/visits";

const FIELD_ORDER: ExperienceField[] = [
  "name",
  "slug",
  "durationMinutes",
  "maxGroupSize",
  "price",
  "priceUnit",
  "description",
  "image",
];

export function ExperienceForm({ experience }: { experience?: Experience }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ExperienceFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState(experience?.name ?? "");
  const [slug, setSlug] = useState(experience?.slug ?? "");
  // Al editar, el slug ya existe (y puede estar en links): no lo pisamos al cambiar el nombre.
  const [slugTouched, setSlugTouched] = useState(Boolean(experience));

  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  const imageSrc = preview ?? experience?.imageUrl ?? null;

  const invalid = (field: ExperienceField) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormError(null);

    // Misma validación que el servidor, para responder al instante.
    const parsed = parseExperienceFormData(formData);
    const clientErrors: ExperienceFieldErrors = parsed.ok ? {} : { ...parsed.errors };
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const imageError = validateImageFile(file);
      if (imageError) clientErrors.image = imageError;
    } else if (!experience) {
      clientErrors.image = "Subí una imagen del paquete";
    }

    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field]);
    if (firstInvalid) {
      setErrors(clientErrors);
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await saveExperience(experience?.id ?? null, formData);
      if (result.ok) {
        toast.success(experience ? "Paquete actualizado" : "Paquete creado", {
          description: name,
        });
        router.push("/admin/visitas");
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
          Datos del paquete
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
            placeholder="Cata Premium"
            className={cn(controlClass, "h-10")}
            {...invalid("name")}
          />
        </Field>

        <Field
          id="slug"
          label="Slug (para enlazar)"
          required
          error={errors.slug}
          hint={
            slug
              ? `/visitas/reservar?experiencia=${slug}`
              : "Se genera a partir del nombre"
          }
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
          id="durationMinutes"
          label="Duración (minutos)"
          required
          error={errors.durationMinutes}
          hint="Aproximada. Ej: 90 se muestra como «1 h 30 min»."
        >
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            defaultValue={experience?.durationMinutes}
            placeholder="60"
            className={cn(controlClass, "h-10")}
            {...invalid("durationMinutes")}
          />
        </Field>

        <Field
          id="maxGroupSize"
          label="Capacidad máxima (personas)"
          error={errors.maxGroupSize}
          hint="Opcional. Si la cargás, el formulario público no acepta grupos más grandes."
        >
          <input
            id="maxGroupSize"
            name="maxGroupSize"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            defaultValue={experience?.maxGroupSize ?? ""}
            placeholder="Sin tope"
            className={cn(controlClass, "h-10")}
            {...invalid("maxGroupSize")}
          />
        </Field>

        <Field
          id="price"
          label="Precio (ARS)"
          required
          error={errors.price}
          hint="Con 0 el sitio muestra «Precio a consultar»."
        >
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={experience?.price}
            className={cn(controlClass, "h-10")}
            {...invalid("price")}
          />
        </Field>

        <Field id="priceUnit" label="El precio es" required error={errors.priceUnit}>
          <select
            id="priceUnit"
            name="priceUnit"
            defaultValue={experience?.priceUnit ?? "por persona"}
            className={cn(controlClass, "h-10")}
            {...invalid("priceUnit")}
          >
            {PRICE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit === "por persona" ? "Por persona" : "Por grupo"}
              </option>
            ))}
          </select>
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
            rows={5}
            defaultValue={experience?.description}
            placeholder="Qué incluye, qué se recorre, qué vinos se prueban…"
            className={cn(controlClass, "py-2 leading-relaxed")}
            {...invalid("description")}
          />
        </Field>
      </section>

      <section className="border border-input bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-cream">Imagen</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-44 w-56 shrink-0 items-center justify-center border border-input bg-muted">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) o URL remota arbitraria
              <img
                src={imageSrc}
                alt={
                  preview
                    ? "Vista previa de la nueva imagen"
                    : `Imagen de ${experience?.name}`
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus aria-hidden className="h-8 w-8 text-stone" strokeWidth={1.5} />
            )}
          </div>

          <Field
            id="image"
            label={experience ? "Reemplazar imagen" : "Subir imagen"}
            required={!experience}
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
            defaultChecked={experience?.active ?? true}
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span>
            <span className="block text-sm font-medium text-cream">Activo</span>
            <span className="block text-xs text-stone">
              Si lo desmarcás, el paquete se oculta de Visitas y Catas y no se puede
              reservar, pero no se borra ni pierde sus solicitudes.
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
          {pending ? "Guardando…" : experience ? "Guardar cambios" : "Crear paquete"}
        </button>
        <Link
          href="/admin/visitas"
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
