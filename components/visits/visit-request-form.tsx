"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  Field,
  FormSection,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/checkout/fields";
import { createVisitRequest } from "@/app/(site)/visitas/reservar/actions";
import { formatDuration } from "@/lib/visits";
import { formatPrice } from "@/lib/format";
import {
  groupSizeExceededMessage,
  visitRequestSchema,
  type VisitRequestData,
  type VisitRequestValues,
} from "@/lib/validation/visit";

export type ExperienceOption = {
  id: string;
  name: string;
  price: string;
  priceUnit: string;
  durationMinutes: number;
  maxGroupSize: number | null;
};

export function VisitRequestForm({
  experiences,
  initialExperienceId,
}: {
  experiences: ExperienceOption[];
  initialExperienceId: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<VisitRequestValues, unknown, VisitRequestData>({
    resolver: zodResolver(visitRequestSchema),
    defaultValues: {
      experienceId: initialExperienceId,
      fullName: "",
      phone: "",
      email: "",
      preferredDate: "",
      comments: "",
      website: "",
    },
  });

  const selectedId = useWatch({ control, name: "experienceId" });
  const selected = experiences.find((experience) => experience.id === selectedId);

  async function onSubmit(values: VisitRequestData) {
    setServerError(null);

    // El mismo control que hace el servidor, para avisar sin ir y volver.
    if (selected?.maxGroupSize && values.groupSize > selected.maxGroupSize) {
      setError("groupSize", {
        message: groupSizeExceededMessage(selected.maxGroupSize),
      });
      setFocus("groupSize");
      return;
    }

    const result = await createVisitRequest(values);

    if (result.ok) {
      router.push(`/visitas/confirmacion?solicitud=${result.requestId}`);
      return;
    }

    if (result.kind === "validation") {
      const fields = Object.keys(result.fieldErrors) as (keyof VisitRequestValues)[];
      for (const field of fields) {
        setError(field, { message: result.fieldErrors[field] });
      }
      if (fields[0]) setFocus(fields[0]);
      return;
    }

    setServerError(result.message);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-2xl"
    >
      {/* Honeypot: fuera de la vista y del foco. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <FormSection step="01" title="Paquete">
        <Field
          label="Elegí tu experiencia"
          htmlFor="experienceId"
          error={errors.experienceId?.message}
        >
          <SelectInput
            id="experienceId"
            register={register("experienceId")}
            error={errors.experienceId?.message}
          >
            <option value="" className="bg-ink">
              Elegí un paquete
            </option>
            {experiences.map((experience) => (
              <option key={experience.id} value={experience.id} className="bg-ink">
                {experience.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        {selected && (
          <p className="mt-3 text-xs leading-relaxed text-stone">
            {formatDuration(selected.durationMinutes)}
            {Number(selected.price) > 0 &&
              ` · ${formatPrice(selected.price)} ${selected.priceUnit}`}
            {selected.maxGroupSize && ` · hasta ${selected.maxGroupSize} personas`}
          </p>
        )}
      </FormSection>

      <FormSection step="02" title="Tus datos">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field
            label="Nombre completo"
            htmlFor="fullName"
            error={errors.fullName?.message}
            className="sm:col-span-2"
          >
            <TextInput
              id="fullName"
              register={register("fullName")}
              error={errors.fullName?.message}
              autoComplete="name"
              placeholder="Nombre y apellido"
            />
          </Field>
          <Field
            label="Teléfono (WhatsApp)"
            htmlFor="phone"
            error={errors.phone?.message}
            hint="Con código de área. Por acá te contactamos."
          >
            <TextInput
              id="phone"
              type="tel"
              inputMode="tel"
              register={register("phone")}
              error={errors.phone?.message}
              autoComplete="tel"
              placeholder="11 5555-0101"
            />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <TextInput
              id="email"
              type="email"
              inputMode="email"
              register={register("email")}
              error={errors.email?.message}
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection step="03" title="Tu visita">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-[1fr_180px]">
          <Field
            label="Fecha preferida"
            htmlFor="preferredDate"
            error={errors.preferredDate?.message}
            hint="No hay agenda online: contanos qué días te vienen bien y lo coordinamos."
          >
            <TextInput
              id="preferredDate"
              register={register("preferredDate")}
              error={errors.preferredDate?.message}
              placeholder="Ej: primer fin de semana de abril"
            />
          </Field>
          <Field
            label="Cantidad de personas"
            htmlFor="groupSize"
            error={errors.groupSize?.message}
          >
            <TextInput
              id="groupSize"
              type="number"
              inputMode="numeric"
              min={1}
              max={selected?.maxGroupSize ?? undefined}
              register={register("groupSize", { valueAsNumber: true })}
              error={errors.groupSize?.message}
              placeholder="2"
            />
          </Field>
          <Field
            label="Comentarios"
            htmlFor="comments"
            optional
            error={errors.comments?.message}
            className="sm:col-span-2"
          >
            <TextArea
              id="comments"
              register={register("comments")}
              error={errors.comments?.message}
              placeholder="Alergias o restricciones, ocasión especial, dudas…"
            />
          </Field>
        </div>
      </FormSection>

      {serverError && (
        <p
          role="alert"
          className="mb-6 border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm leading-snug text-red-200"
        >
          {serverError}
        </p>
      )}

      <div className="border-t border-hairline-mid pt-9">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[52px] w-full cursor-pointer items-center justify-center bg-wine px-10 text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Enviando solicitud…" : "Enviar solicitud"}
        </button>
        <p className="mt-4 max-w-md text-xs leading-relaxed text-stone">
          Esto es una solicitud, no una reserva confirmada. La bodega te
          contacta para acordar fecha y horario.
        </p>
      </div>
    </form>
  );
}
