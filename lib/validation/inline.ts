// Validación de la edición en línea de las tablas del admin. Sin imports de servidor: la usan el
// campo del navegador (para responder al instante) y las Server Actions (que la repiten).

export type ParseResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

// Resultado de un guardado en línea.
//  - invalid: el valor no es aceptable; se muestra el error junto al campo.
//  - error: falló el guardado (servidor, base, estado que cambió); se muestra un toast.
export type InlineResult<T> =
  | { ok: true; value: T }
  | { ok: false; kind: "invalid" | "error"; message: string };

export const MAX_PRICE = 99_999_999.99;
export const MAX_STOCK = 1_000_000;

const PRICE_PATTERN = /^\d+([.,]\d{1,2})?$/;

// Precio en pesos. Acepta "15000", "15000,5" o "15000.50". Rechaza "15.000": un punto seguido de
// tres dígitos es un separador de miles, y guardarlo como 15 sería un error caro.
// `min: "zero"` permite 0 (precio a cargar / a consultar); `min: "positive"` lo exige mayor a 0.
export function parsePrice(
  text: string,
  { min }: { min: "zero" | "positive" },
): ParseResult {
  const raw = text.trim();
  if (raw === "") return { ok: false, error: "Ingresá un precio" };
  if (raw.startsWith("-")) return { ok: false, error: "No puede ser negativo" };
  if (!PRICE_PATTERN.test(raw)) {
    return {
      ok: false,
      error: /^\d{1,3}([.,]\d{3})+([.,]\d{1,2})?$/.test(raw)
        ? "Sin puntos de miles (ej. 15000,50)"
        : "Número inválido (ej. 15000,50)",
    };
  }

  const amount = Number(raw.replace(",", "."));
  if (min === "positive" && amount <= 0) {
    return { ok: false, error: "Tiene que ser mayor a 0" };
  }
  if (amount > MAX_PRICE) return { ok: false, error: "El precio es demasiado alto" };
  return { ok: true, value: amount.toFixed(2) };
}

export function parseStock(text: string): ParseResult {
  const raw = text.trim();
  if (raw === "") return { ok: false, error: "Ingresá el stock" };
  if (raw.startsWith("-")) return { ok: false, error: "No puede ser negativo" };
  if (!/^\d+$/.test(raw)) return { ok: false, error: "Ingresá un número entero" };
  const amount = Number(raw);
  if (amount > MAX_STOCK) return { ok: false, error: "El stock es demasiado alto" };
  return { ok: true, value: String(amount) };
}

// Cómo se muestra un valor guardado dentro del campo: sin ceros de más y con coma decimal.
// "15000.00" => "15000", "8900.50" => "8900,5"
export const priceToInput = (value: string | number) =>
  String(Number(value)).replace(".", ",");

// Cambios de un solo campo que aceptan las Server Actions.
export type PriceOrStockInput =
  | { field: "price"; value: string }
  | { field: "stock"; value: string };
export type ProductInlineInput = PriceOrStockInput | { field: "active"; value: boolean };
export type PriceInlineInput = { field: "price"; value: string } | { field: "active"; value: boolean };
