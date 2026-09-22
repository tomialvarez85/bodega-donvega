"use client";

import {
  updateComboField,
  updateExperienceField,
  updateProductField,
} from "@/app/admin/(panel)/inline-actions";
import { InlineNumberField } from "@/components/admin/inline/inline-number-field";
import { InlineSwitch } from "@/components/admin/inline/inline-switch";
import {
  parsePrice,
  parseStock,
  priceToInput,
  type InlineResult,
} from "@/lib/validation/inline";

// Celdas editables de las tablas del admin (productos, combos y visitas). Todas comparten el mismo mecanismo de
// guardado (useInlineSave) y cada una solo enlaza el campo con su Server Action.

// Las acciones devuelven string | boolean según el campo; acá se acota al tipo que espera cada celda.
const asText = (result: InlineResult<string | boolean>): InlineResult<string> =>
  result.ok ? { ok: true, value: String(result.value) } : result;
const asFlag = (result: InlineResult<string | boolean>): InlineResult<boolean> =>
  result.ok ? { ok: true, value: result.value === true } : result;

// --- Productos ---------------------------------------------------------------------------------

export function ProductPriceCell({ id, name, price }: { id: string; name: string; price: string }) {
  return (
    <InlineNumberField
      value={priceToInput(price)}
      label={`Precio de ${name}`}
      prefix="$"
      parse={(text) => parsePrice(text, { min: "zero" })}
      save={async (value) => asText(await updateProductField(id, { field: "price", value }))}
      format={priceToInput}
    />
  );
}

export function ProductStockCell({ id, name, stock }: { id: string; name: string; stock: number }) {
  return (
    <InlineNumberField
      value={String(stock)}
      label={`Stock de ${name}`}
      inputMode="numeric"
      widthClass="w-20"
      parse={parseStock}
      save={async (value) => asText(await updateProductField(id, { field: "stock", value }))}
      format={String}
    />
  );
}

export function ProductActiveCell({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <InlineSwitch
      checked={active}
      label={`Activo: ${name}`}
      save={async (value) => asFlag(await updateProductField(id, { field: "active", value }))}
    />
  );
}

// --- Combos ------------------------------------------------------------------------------------

export function ComboPriceCell({ id, name, price }: { id: string; name: string; price: string }) {
  return (
    <InlineNumberField
      value={priceToInput(price)}
      label={`Precio de ${name}`}
      prefix="$"
      parse={(text) => parsePrice(text, { min: "positive" })}
      save={async (value) => asText(await updateComboField(id, { field: "price", value }))}
      format={priceToInput}
    />
  );
}

export function ComboActiveCell({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <InlineSwitch
      checked={active}
      label={`Activo: ${name}`}
      save={async (value) => asFlag(await updateComboField(id, { field: "active", value }))}
    />
  );
}

// --- Visitas (paquetes) ------------------------------------------------------------------------

export function ExperiencePriceCell({
  id,
  name,
  price,
  unit,
}: {
  id: string;
  name: string;
  price: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <InlineNumberField
        value={priceToInput(price)}
        label={`Precio de ${name} (${unit})`}
        prefix="$"
        parse={(text) => parsePrice(text, { min: "zero" })}
        save={async (value) => asText(await updateExperienceField(id, { field: "price", value }))}
        format={priceToInput}
      />
      <span className="text-[11px] text-stone">
        {Number(price) > 0 ? unit : "0 = a consultar"}
      </span>
    </div>
  );
}

export function ExperienceActiveCell({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <InlineSwitch
      checked={active}
      label={`Activo: ${name}`}
      save={async (value) => asFlag(await updateExperienceField(id, { field: "active", value }))}
    />
  );
}

