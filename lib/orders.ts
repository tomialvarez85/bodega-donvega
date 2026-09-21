// Constantes y helpers de pedidos sin imports de servidor (los usa también el cliente).

export const ORDER_STATUSES = [
  "pendiente",
  "confirmado",
  "entregado",
  "cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_METHODS = ["envio", "retiro"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// pendiente → confirmado → entregado; cancelado en cualquier momento; cancelado es final.
export const NEXT_STATUSES: Record<OrderStatus, readonly OrderStatus[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["entregado", "cancelado"],
  entregado: ["cancelado"],
  cancelado: [],
};

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  NEXT_STATUSES[from].includes(to);

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  envio: "Envío a domicilio",
  retiro: "Retiro en el local",
};

// Métodos de pago a coordinar (no hay cobro online). Se guardan como texto en orders.payment_method.
export const PAYMENT_METHODS = ["efectivo", "transferencia"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
};

// Valores conocidos con su nombre completo; cualquier otro texto se muestra tal cual con la
// primera letra en mayúscula.
export function paymentLabel(method: string) {
  if (method in PAYMENT_LABELS) return PAYMENT_LABELS[method as PaymentMethod];
  return method.charAt(0).toUpperCase() + method.slice(1);
}

export const formatOrderNumber = (number: number) => `#${number}`;

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export const formatDateTime = (date: Date) => dateTimeFormatter.format(date);

// "YYYY-MM-DD" válido o undefined (descarta fechas inexistentes como 2026-02-31).
export function parseDateParam(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? undefined
    : value;
}

// Argentina no tiene horario de verano: UTC-3 fijo.
export const startOfDay = (day: string) => new Date(`${day}T00:00:00-03:00`);
export const startOfNextDay = (day: string) =>
  new Date(startOfDay(day).getTime() + 24 * 60 * 60 * 1000);
