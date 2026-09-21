import "dotenv/config";

import { count } from "drizzle-orm";

import { db, sql } from "../lib/db";
import { orderItems, orders, products } from "../lib/schema";

// Pedidos de ejemplo para probar el admin mientras no exista el checkout. Usan precios
// ilustrativos propios (los vinos reales quedan con price 0 hasta que se cargue el real).
// Uso: npm run db:seed-orders  (no hace nada si ya hay pedidos)

const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * day);

const samples = [
  {
    order: {
      status: "pendiente",
      customerName: "Lucía Fernández",
      customerEmail: "lucia.fernandez@example.com",
      customerPhone: "+54 9 11 5555-0101",
      deliveryMethod: "envio",
      shippingAddress: "Av. Santa Fe 1234, 5° B, CABA",
      paymentMethod: "transferencia",
      notes: "Es un regalo: si pueden, sin ticket con precios. ¡Gracias!",
      createdAt: daysAgo(0),
    },
    lines: [
      { slug: "malbec-reserva", quantity: 2, price: 16500 },
      { slug: "cabernet-franc", quantity: 1, price: 17800 },
    ],
  },
  {
    order: {
      status: "pendiente",
      customerName: "Martín Gómez",
      customerEmail: "martin.gomez@example.com",
      customerPhone: "0261 4555-0199",
      deliveryMethod: "retiro",
      paymentMethod: "efectivo",
      notes: null,
      createdAt: daysAgo(1),
    },
    lines: [{ slug: "malbec-joven", quantity: 6, price: 8900 }],
  },
  {
    order: {
      status: "confirmado",
      customerName: "Sofía Pereyra",
      customerEmail: "sofia.pereyra@example.com",
      customerPhone: "5491144440123",
      deliveryMethod: "envio",
      shippingAddress: "Calle Mitre 456, Rosario, Santa Fe",
      paymentMethod: "transferencia",
      notes: "Llamar antes de pasar, por favor.",
      createdAt: daysAgo(3),
    },
    lines: [
      { slug: "adn-cabernet-sauvignon", quantity: 1, price: 34500 },
      { slug: "adn-bonarda", quantity: 2, price: 14900 },
    ],
  },
  {
    order: {
      status: "entregado",
      customerName: "Diego Ramos",
      customerEmail: "diego.ramos@example.com",
      customerPhone: "11 6666-0202",
      deliveryMethod: "retiro",
      paymentMethod: "efectivo",
      notes: null,
      createdAt: daysAgo(12),
    },
    lines: [
      { slug: "malbec-joven", quantity: 3, price: 8900 },
      { slug: "cabernet-franc", quantity: 3, price: 17800 },
    ],
  },
  {
    order: {
      status: "cancelado",
      customerName: "Carolina Ibarra",
      customerEmail: "carolina.ibarra@example.com",
      customerPhone: "+54 9 351 555-0303",
      deliveryMethod: "envio",
      shippingAddress: "Belgrano 88, Córdoba",
      paymentMethod: "transferencia",
      notes: "Cambié de idea, disculpen.",
      createdAt: daysAgo(20),
    },
    lines: [{ slug: "cabernet-franc", quantity: 2, price: 17800 }],
  },
] as const;

async function main() {
  const [{ value }] = await db.select({ value: count() }).from(orders);
  if (value > 0) {
    console.log(`Ya hay ${value} pedidos: no se agrega nada.`);
    return;
  }

  const catalog = await db.select().from(products);
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));

  for (const { order, lines } of samples) {
    const resolved = lines.map(({ slug, quantity, price }) => {
      const product = bySlug.get(slug);
      if (!product) throw new Error(`Falta el producto "${slug}": corré db:seed primero.`);
      return { product, quantity, price };
    });
    const total = resolved.reduce(
      (sum, { price, quantity }) => sum + price * quantity,
      0,
    );

    const [created] = await db
      .insert(orders)
      .values({ ...order, total: total.toFixed(2) })
      .returning({ id: orders.id });

    await db.insert(orderItems).values(
      resolved.map(({ product, quantity, price }) => ({
        orderId: created.id,
        productId: product.id,
        productName: product.name,
        unitPrice: price.toFixed(2),
        quantity,
      })),
    );
  }

  console.log(`Seed OK: ${samples.length} pedidos de ejemplo.`);
}

main()
  .catch((error) => {
    console.error("Seed de pedidos falló:", error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
