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
