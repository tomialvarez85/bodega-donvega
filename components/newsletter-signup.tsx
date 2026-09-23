"use client";

import { useId, useState, useTransition } from "react";

import { subscribeToNewsletter } from "@/app/(site)/newsletter-actions";
import { newsletterSchema } from "@/lib/validation/newsletter";
import { cn } from "@/lib/utils";

type Status =
  | { state: "idle" }
  | { state: "error"; message: string }
  | { state: "success"; message: string };

// text-base (16px): en iOS Safari, un input con menos de 16px de fuente dispara zoom al enfocar.
// Ancho completo por defecto (la fila está apilada); "flex-1" se agrega solo cuando el layout
// pasa a fila (ver más abajo): puesto siempre, "flex-1" fija flex-basis en 0%, que en una fila
// apilada (eje principal vertical) pisa el height y encoge el campo a casi nada.
const inputClass =
  "h-11 w-full border border-hairline-mid bg-transparent px-4 text-base text-cream outline-none placeholder:text-stone focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold aria-invalid:border-red-400 aria-invalid:ring-1 aria-invalid:ring-red-400/40 md:text-sm";

const buttonClass =
  "flex h-11 shrink-0 cursor-pointer items-center justify-center bg-wine px-6 text-xs font-medium tracking-[0.14em] text-cream uppercase transition-[background-color,transform] duration-150 hover:bg-[#501320] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100";

// Suscripción al newsletter: solo captura y guarda el email (ver app/(site)/newsletter-actions.ts).
// Dos variantes con el mismo comportamiento: "compact" apila el campo y el botón (footer, en
// una columna angosta) y "inline" los pone en fila desde sm (secciones más anchas, como el Home).
export function NewsletterSignup({
  variant = "inline",
  className,
}: {
  variant?: "compact" | "inline";
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Misma validación que el servidor, para responder al instante.
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus({
        state: "error",
        message: parsed.error.issues[0]?.message ?? "Ingresá un email válido",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await subscribeToNewsletter(parsed.data);
        if (result.ok) {
          setStatus({
            state: "success",
            message: result.alreadySubscribed
              ? "Ya estás suscripto, ¡gracias!"
              : "¡Listo! Te vamos a mantener al tanto de nuevos vinos y novedades de la bodega.",
          });
          return;
        }
        setStatus({ state: "error", message: result.message });
      } catch {
        // Sin conexión, o la Server Action ni llegó a responder: no dejamos que reviente la
        // página entera, mostramos el mismo mensaje que un error del servidor.
        setStatus({
          state: "error",
          message: "No pudimos guardar tu suscripción. Probá de nuevo en un momento.",
        });
      }
    });
  }

  if (status.state === "success") {
    return (
      <p role="status" className={cn("text-sm leading-relaxed text-gold", className)}>
        {status.message}
      </p>
    );
  }

  const invalid = status.state === "error";
  const errorId = `${id}-error`;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("flex flex-col gap-2.5", className)}
    >
      <div
        className={cn(
          "flex gap-2.5",
          variant === "compact" ? "flex-col" : "flex-col sm:flex-row",
        )}
      >
        <label htmlFor={id} className="sr-only">
          Email
        </label>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (invalid) setStatus({ state: "idle" });
          }}
          disabled={pending}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(
            inputClass,
            // Recién en fila (desde sm, y solo en "inline": "compact" nunca pasa a fila) el
            // campo debe repartirse el ancho con el botón.
            variant === "inline" && "sm:min-w-0 sm:flex-1",
          )}
        />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {invalid && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-300">
          {status.message}
        </p>
      )}
    </form>
  );
}
