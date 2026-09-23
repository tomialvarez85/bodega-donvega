const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// `price` llega como string desde Postgres (numeric). Ej: "16500.00" => "$ 16.500".
export function formatPrice(price: string | number) {
  return priceFormatter.format(Number(price));
}

const integerFormatter = new Intl.NumberFormat("es-AR");
const decimalFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// 10000 => "10.000"
export const formatInteger = (value: number) => integerFormatter.format(value);

// "13.6" => "13,6"
export const formatDecimal = (value: string | number) =>
  decimalFormatter.format(Number(value));

// Argentina no tiene horario de verano: UTC-3 fijo.
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

// Fecha y hora cortas en horario de Argentina. Ej: "22/9/26, 17:34".
export const formatDateTime = (date: Date) => dateTimeFormatter.format(date);
