"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Piezas del formulario de checkout. Mismo lenguaje que el resto del sitio: etiquetas en
// mayúsculas chicas, hairlines, foco dorado, sin sombras.

export const eyebrow = "text-[10px] tracking-[0.18em] text-sand uppercase";

const controlClass =
  "rounded-none border-hairline-mid bg-transparent px-4 text-cream placeholder:text-stone focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold aria-invalid:border-red-400 aria-invalid:ring-1 aria-invalid:ring-red-400/40";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className={eyebrow}>
        {label}
        {optional && <span className="ml-1.5 text-stone normal-case tracking-normal">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-stone">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  error,
  register,
  ...props
}: {
  id: string;
  error?: string;
  register: UseFormRegisterReturn;
} & Omit<React.ComponentProps<"input">, "id" | "name" | "onChange" | "onBlur" | "ref">) {
  return (
    <Input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn("h-12", controlClass)}
      {...register}
      {...props}
    />
  );
}

export function TextArea({
  id,
  error,
  register,
  ...props
}: {
  id: string;
  error?: string;
  register: UseFormRegisterReturn;
} & Omit<React.ComponentProps<"textarea">, "id" | "name" | "onChange" | "onBlur" | "ref">) {
  return (
    <Textarea
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn("min-h-28 py-3", controlClass)}
      {...register}
      {...props}
    />
  );
}

// Select nativo (accesible y con buen soporte móvil), con el mismo aspecto que los inputs.
export function SelectInput({
  id,
  error,
  register,
  children,
  ...props
}: {
  id: string;
  error?: string;
  register: UseFormRegisterReturn;
  children: ReactNode;
} & Omit<React.ComponentProps<"select">, "id" | "name" | "onChange" | "onBlur" | "ref">) {
  return (
    <select
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        "h-12 w-full min-w-0 border bg-transparent px-3 text-base text-cream [color-scheme:dark] focus-visible:outline-none md:text-sm",
        "border-hairline-mid focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold aria-invalid:border-red-400 aria-invalid:ring-1 aria-invalid:ring-red-400/40",
      )}
      {...register}
      {...props}
    >
      {children}
    </select>
  );
}

// Opción de un grupo de radios, como tarjeta con hairline. El input real está oculto pero es
// navegable con teclado (flechas) y anuncia su estado; el borde dorado marca la elegida.
export function ChoiceCard({
  register,
  value,
  title,
  description,
}: {
  register: UseFormRegisterReturn;
  value: string;
  title: string;
  description: string;
}) {
  return (
    <label className="relative flex cursor-pointer items-start gap-3.5 border border-hairline-mid p-4 transition-colors hover:border-sand/50 has-[:checked]:border-gold has-[:checked]:bg-white/[0.03] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold">
      <input type="radio" value={value} className="peer sr-only" {...register} />
      <span
        aria-hidden
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-sand/60 transition-colors after:h-2 after:w-2 after:rounded-full after:bg-gold after:opacity-0 after:transition-opacity peer-checked:border-gold peer-checked:after:opacity-100"
      />
      <span>
        <span className="block text-sm text-cream">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-sand">{description}</span>
      </span>
    </label>
  );
}

export function FormSection({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hairline-mid py-9">
      <p className="mb-2 flex items-center gap-4 text-[10px] tracking-[0.26em] text-gold uppercase">
        {step}
      </p>
      <h2 className="mb-6 font-display text-[clamp(24px,3vw,30px)] leading-[1.1] font-normal text-cream">
        {title}
      </h2>
      {children}
    </section>
  );
}
