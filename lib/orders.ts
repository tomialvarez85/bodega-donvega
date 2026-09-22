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
