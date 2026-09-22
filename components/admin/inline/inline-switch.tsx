"use client";

import { useState } from "react";

import {
  SaveIndicator,
  useInlineSave,
} from "@/components/admin/inline/use-inline-save";
import type { InlineResult } from "@/lib/validation/inline";
import { cn } from "@/lib/utils";

// Interruptor activo/inactivo dentro de una fila. Guarda apenas se cambia; si falla, vuelve atrás.
export function InlineSwitch({
  checked,
  label,
  save,
}: {
  checked: boolean;
  /** Nombre accesible (incluye a qué registro pertenece). */
  label: string;
  save: (next: boolean) => Promise<InlineResult<boolean>>;
}) {
  const { status, run } = useInlineSave();
  const [value, setValue] = useState(checked);
  const [prevChecked, setPrevChecked] = useState(checked);

  // El estado guardado cambió desde afuera (la tabla se recargó).
  if (checked !== prevChecked) {
    setPrevChecked(checked);
    setValue(checked);
  }

  async function toggle() {
    const previous = value;
    const next = !previous;
    setValue(next);
    const saved = await run(() => save(next));
    setValue(saved ?? previous);
  }

  const saving = status.state === "saving";

  return (
    <div className="flex items-center gap-2">
      <SaveIndicator status={status} />
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={saving}
        onClick={toggle}
        className={cn(
          "relative h-7 w-12 shrink-0 cursor-pointer border after:absolute after:-inset-1.5 after:content-['']  transition-colors focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60",
          value ? "border-green-500/50 bg-green-500/25" : "border-input bg-hairline",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 transition-transform motion-reduce:transition-none",
            value ? "translate-x-[22px] bg-green-300" : "translate-x-0 bg-sand",
          )}
        />
      </button>
      <span
        aria-hidden
        className={cn("w-14 text-xs", value ? "text-green-300" : "text-sand")}
      >
        {value ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}
