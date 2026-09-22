"use client";

import { Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { InlineResult } from "@/lib/validation/inline";

// Mecanismo único de guardado en línea de las tablas del admin (productos, combos, pedidos,
// visitas y reservas): mismo ciclo de estados, mismos avisos y misma forma de revertir.

export type InlineStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  | { state: "invalid"; message: string };

const SAVED_MS = 1800;
const INVALID_MS = 5000;

export function useInlineSave() {
  const [status, setStatus] = useState<InlineStatus>({ state: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback((next: InlineStatus, ms?: number) => {
    clearTimeout(timer.current);
    setStatus(next);
    if (ms) timer.current = setTimeout(() => setStatus({ state: "idle" }), ms);
  }, []);

  // Error de validación detectado en el navegador (no llegó a guardarse nada).
  const reject = useCallback(
    (message: string) => show({ state: "invalid", message }, INVALID_MS),
    [show],
  );

  const clear = useCallback(() => show({ state: "idle" }), [show]);

  // Ejecuta el guardado. Devuelve el valor confirmado por el servidor, o null si hay que revertir.
  const run = useCallback(
    async <T,>(save: () => Promise<InlineResult<T>>): Promise<T | null> => {
      show({ state: "saving" });
      try {
        const result = await save();
        if (result.ok) {
          show({ state: "saved" }, SAVED_MS);
          return result.value;
        }
        if (result.kind === "invalid") {
          show({ state: "invalid", message: result.message }, INVALID_MS);
        } else {
          show({ state: "idle" });
          toast.error(result.message);
        }
      } catch {
        // Red caída o error del servidor que no llegó a ser una respuesta.
        show({ state: "idle" });
        toast.error("No se pudo guardar el cambio. Revisá tu conexión y probá de nuevo.");
      }
      return null;
    },
    [show],
  );

  return { status, run, reject, clear };
}

// Espacio fijo de 16 px junto al campo: aparece el spinner o el check sin mover nada.
export function SaveIndicator({ status }: { status: InlineStatus }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
    >
      {status.state === "saving" && (
        <>
          <Loader2
            aria-hidden
            className="h-3.5 w-3.5 animate-spin text-sand motion-reduce:animate-none"
          />
          <span className="sr-only" title="Guardando…">
            Guardando…
          </span>
        </>
      )}
      {status.state === "saved" && (
        <>
          <Check aria-hidden className="h-3.5 w-3.5 text-green-300" strokeWidth={2.5} />
          <span className="sr-only" title="Guardado">
            Guardado
          </span>
        </>
      )}
    </span>
  );
}

export function InlineError({ status, id }: { status: InlineStatus; id: string }) {
  if (status.state !== "invalid") return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 max-w-[10.5rem] text-right text-[11px] leading-snug whitespace-normal text-red-300"
    >
      {status.message}
    </p>
  );
}
