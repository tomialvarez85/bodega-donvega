import { z } from "zod";

import { DELIVERY_METHODS, PAYMENT_METHODS } from "@/lib/orders";
import { phoneSchema } from "@/lib/validation/phone";

// Validación del checkout: la usan el formulario (react-hook-form) y la Server Action.

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} es demasiado largo`);

export const checkoutSchema = z
  .object({
    fullName: text("El nombre", 120).refine(
      (value) => value.length >= 3,
      "Ingresá tu nombre completo",
    ),
    // Cualquier formato razonable: puede ser un cliente extranjero, y ya no se usa para armar un
    // link de wa.me directo (el pedido se coordina desde el chat que el cliente abre con la
    // bodega, no al revés).
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .min(1, "El email es obligatorio")
      .max(160, "El email es demasiado largo")
      .pipe(z.email("Ingresá un email válido")),

    deliveryMethod: z.enum(DELIVERY_METHODS, {
      error: "Elegí cómo querés recibir tu pedido",
    }),
    // Solo se exigen cuando es envío a domicilio (ver superRefine).
    street: z.string().trim().max(160, "Es demasiado largo"),
    apartment: z.string().trim().max(60, "Es demasiado largo"),
    city: z.string().trim().max(100, "Es demasiado largo"),
    province: z.string().trim().max(100, "Es demasiado largo"),
    postalCode: z.string().trim().max(12, "Es demasiado largo"),

    paymentMethod: z.enum(PAYMENT_METHODS, {
      error: "Elegí cómo vas a pagar",
    }),
    notes: z.string().trim().max(1000, "Máximo 1000 caracteres"),
    // Honeypot: un humano no lo ve ni lo completa.
    website: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "envio") return;
    const required = [
      ["street", "La calle y el número son obligatorios"],
      ["city", "La localidad es obligatoria"],
      ["province", "La provincia es obligatoria"],
      ["postalCode", "El código postal es obligatorio"],
    ] as const;
    for (const [field, message] of required) {
      if (!data[field]) ctx.addIssue({ code: "custom", path: [field], message });
    }
  });

export type CheckoutValues = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

// Líneas del carrito que viajan al servidor. El precio es el que el cliente vio: el servidor
// lo compara con el de la base y nunca lo usa para cobrar.
export const orderLineSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().min(0),
});
export const orderLinesSchema = z.array(orderLineSchema).min(1).max(30);
export type OrderLine = z.infer<typeof orderLineSchema>;

// "Av. Santa Fe 1234, 5° B, CABA, Buenos Aires (CP 1425)"
export function composeAddress(
  data: Pick<
    CheckoutData,
    "street" | "apartment" | "city" | "province" | "postalCode"
  >,
) {
  const parts = [data.street, data.apartment, data.city, data.province].filter(
    Boolean,
  );
  return `${parts.join(", ")} (CP ${data.postalCode})`;
}
