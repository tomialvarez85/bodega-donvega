"use client";

import { useId, useRef, useState } from "react";

import {
  InlineError,
  SaveIndicator,
  useInlineSave,
} from "@/components/admin/inline/use-inline-save";
import type { InlineResult, ParseResult } from "@/lib/validation/inline";
import { cn } from "@/lib/utils";

// Campo numérico editable dentro de una fila. Se guarda solo al perder el foco (o con Enter);
// Escape descarta. Si el valor no es válido no se guarda, se avisa junto al campo y vuelve el
// valor anterior. Si el guardado falla, toast y vuelve el valor anterior.
export function InlineNumberField({
  value,
  label,
  parse,
  save,
  format,
  prefix,
  inputMode = "decimal",
  widthClass = "w-28",
}: {
  /** Valor guardado, ya formateado para mostrar (ej. "15000" o "8900,5"). */
  value: string;
  /** Nombre accesible del campo (incluye a qué registro pertenece). */
  label: string;
  /** Misma validación que repite el servidor. Devuelve el valor normalizado. */
  parse: (text: string) => ParseResult;
  /** Recibe el valor normalizado y devuelve lo que confirmó el servidor. */
  save: (normalized: string) => Promise<InlineResult<string>>;
  /** Cómo se muestra en el campo un valor que confirmó el servidor. */
  format: (saved: string) => string;
  prefix?: string;
  inputMode?: "decimal" | "numeric";
  widthClass?: string;
}) {
  const errorId = useId();
  const { status, run, reject, clear } = useInlineSave();

  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const [editing, setEditing] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const skipBlur = useRef(false);

  // El valor guardado cambió desde afuera (la tabla se recargó): se sincroniza salvo que se esté
  // escribiendo en este campo.
  if (value !== prevValue) {
    setPrevValue(value);
    setCommitted(value);
    if (!editing) setText(value);
  }

  async function commit() {
    setEditing(false);
    if (skipBlur.current) {
      skipBlur.current = false;
      setText(committed);
      return;
    }
    if (text.trim() === committed) {
      setText(committed);
      return;
    }

    const parsed = parse(text);
    if (!parsed.ok) {
      setText(committed);
      reject(parsed.error);
      return;
    }
    // Mismo número escrito distinto ("15000,00" vs "15000"): no hay nada que guardar.
    const current = parse(committed);
    if (current.ok && current.value === parsed.value) {
      setText(committed);
      return;
    }

    const saved = await run(() => save(parsed.value));
    if (saved === null) {
      setText(committed);
      return;
    }
    const shown = format(saved);
    setCommitted(shown);
    setText(shown);
  }

  const invalid = status.state === "invalid";

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1.5">
        <SaveIndicator status={status} />
        <div className={cn("relative", widthClass)}>
          {prefix && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-stone"
            >
              {prefix}
            </span>
          )}
          <input
            type="text"
            inputMode={inputMode}
            aria-label={label}
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={text}
            disabled={status.state === "saving"}
            onChange={(event) => {
              setText(event.target.value);
              if (invalid) clear();
            }}
            onFocus={(event) => {
              setEditing(true);
              event.currentTarget.select();
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                skipBlur.current = true;
                event.currentTarget.blur();
              }
            }}
            className={cn(
              "h-8 w-full border border-hairline bg-transparent pr-2 text-right text-base text-cream md:text-sm tabular-nums transition-colors outline-none placeholder:text-stone hover:border-input focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold/40 disabled:opacity-60 aria-invalid:border-red-400",
              prefix ? "pl-5" : "pl-2",
            )}
          />
        </div>
      </div>
      <InlineError status={status} id={errorId} />
    </div>
  );
}
