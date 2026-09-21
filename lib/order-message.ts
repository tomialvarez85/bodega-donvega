import { formatPrice } from "./format";
import { DELIVERY_LABELS, formatOrderNumber, paymentLabel } from "./orders";
import type { Order, OrderItem } from "./schema";

// Mensaje que el cliente le manda por WhatsApp a la bodega con el resumen de su pedido.
export function buildOrderWhatsappMessage(
  order: Pick<
    Order,
    | "number"
    | "customerName"
    | "deliveryMethod"
    | "shippingAddress"
    | "paymentMethod"
    | "total"
  >,
  items: Pick<OrderItem, "productName" | "quantity" | "unitPrice">[],
) {
  const lines = items.map(
    (item) =>
      `• ${item.quantity} × ${item.productName} — ${formatPrice(Number(item.unitPrice) * item.quantity)}`,
  );
  const delivery =
    order.deliveryMethod === "envio" && order.shippingAddress
      ? `${DELIVERY_LABELS.envio} (${order.shippingAddress})`
      : DELIVERY_LABELS[order.deliveryMethod];

  return [
    `Hola Don Vega, soy ${order.customerName}. Hice el pedido ${formatOrderNumber(order.number)}:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(order.total)}`,
    `Entrega: ${delivery}`,
    `Pago: ${paymentLabel(order.paymentMethod)}`,
    "",
    "Quedo atento/a para coordinar. ¡Gracias!",
  ].join("\n");
}
