import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { DELIVERY_METHODS, ORDER_STATUSES, type OrderStatus } from "./orders";
import {
  PRICE_UNITS,
  VISIT_REQUEST_STATUSES,
  type VisitRequestStatus,
} from "./visits";

// Premio o puntaje obtenido por un vino. `award` puede ser null (solo puntaje).
export type Award = { points: number; award: string | null; contest: string };

export const products = pgTable(
  "products",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  // Línea de producto de la bodega: "DV" o "ADN".
  line: text("line").notNull(),
  varietal: text("varietal").notNull(),
  // Año de cosecha.
  vintage: integer("vintage"),
  // Pesos argentinos; 0 hasta cargar el precio real. numeric vuelve como string en JS.
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  // Bajada corta comercial. Vacía hasta que se cargue.
  description: text("description").notNull().default(""),
  // URL o path de la imagen de la botella (ej. "/products/malbec-reserva.png").
  imageUrl: text("image_url").notNull(),
  // Tinto | Blanco | Rosado | Espumante
  category: text("category").notNull(),
  active: boolean("active").notNull().default(true),
  isNewRelease: boolean("is_new_release").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Ficha técnica agronómica y de vinificación
  enologist: text("enologist").notNull().default("Victor Vega"),
  origin: text("origin").notNull().default("Tinogasta, Catamarca"),
  altitudeMasl: integer("altitude_masl"),
  vineyardSince: integer("vineyard_since"),
  irrigation: text("irrigation"),
  conduction: text("conduction"),
  soil: text("soil"),
  alcoholPercentage: numeric("alcohol_percentage", { precision: 4, scale: 1 }),
  aging: text("aging"),
  bottlesProduced: integer("bottles_produced"),

  // Notas de cata
  tastingSight: text("tasting_sight"),
  tastingNose: text("tasting_nose"),
  tastingPalate: text("tasting_palate"),

  // Premios: [{ points, award, contest }]
  awards: jsonb("awards").$type<Award[]>().notNull().default([]),

  // Promoción sobre el vino individual. `salePrice` solo cuenta si `isOnSale` es true.
  isOnSale: boolean("is_on_sale").notNull().default(false),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }),
  // Texto de la etiqueta: "Oferta de temporada", "3x2", "Verano 2026"…
  saleLabel: text("sale_label"),
  },
  (table) => [
    // El stock nunca baja de 0: red de seguridad contra ventas simultáneas del último ejemplar.
    check("products_stock_non_negative", sql`${table.stock} >= 0`),
    // Un vino en oferta siempre tiene precio promocional.
    check(
      "products_sale_price_required",
      sql`${table.isOnSale} = false OR ${table.salePrice} IS NOT NULL`,
    ),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Combos: varias botellas a un precio único (ej. "Caja Descubrimiento DV").
// Su contenido está en `combo_items`.
export const combos = pgTable("combos", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  // Pesos argentinos, precio del combo completo.
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Combo = typeof combos.$inferSelect;
export type NewCombo = typeof combos.$inferInsert;

// Relación combo → productos, con la cantidad de botellas de cada uno.
export const comboItems = pgTable(
  "combo_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    comboId: uuid("combo_id")
      .notNull()
      .references(() => combos.id, { onDelete: "cascade" }),
    // Un vino que forma parte de un combo no se puede borrar: primero hay que sacarlo del combo.
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    // Cada vino aparece una sola vez por combo (con su cantidad).
    unique("combo_items_combo_product_unique").on(table.comboId, table.productId),
    check("combo_items_quantity_positive", sql`${table.quantity} > 0`),
    index("combo_items_product_id_idx").on(table.productId),
  ],
);

export type ComboItem = typeof comboItems.$inferSelect;
export type NewComboItem = typeof comboItems.$inferInsert;

export const orderStatus = pgEnum("order_status", ORDER_STATUSES);
export const deliveryMethod = pgEnum("delivery_method", DELIVERY_METHODS);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Número correlativo legible para el cliente y el dueño (#1001, #1002…).
  number: integer("number").generatedAlwaysAsIdentity({ startWith: 1001 }),
  status: orderStatus("status").notNull().default("pendiente"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryMethod: deliveryMethod("delivery_method").notNull(),
  // Solo cuando deliveryMethod = "envio".
  shippingAddress: text("shipping_address"),
  // Texto libre (transferencia, efectivo, etc.): lo define el checkout.
  paymentMethod: text("payment_method").notNull(),
  // Comentarios del cliente.
  notes: text("notes"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Si se borra el producto, el pedido conserva el historial (nombre y precio abajo).
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    // Copia de nombre y precio al momento de la compra.
    productName: text("product_name").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type { OrderStatus };

// Visitas guiadas y catas: los paquetes que ofrece la bodega.
export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    // Duración aproximada.
    durationMinutes: integer("duration_minutes").notNull(),
    // Pesos argentinos; priceUnit aclara si es por persona o por grupo.
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    priceUnit: text("price_unit", { enum: PRICE_UNITS })
      .notNull()
      .default("por persona"),
    // Capacidad máxima del grupo; null = sin tope definido.
    maxGroupSize: integer("max_group_size"),
    imageUrl: text("image_url").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("experiences_duration_positive", sql`${table.durationMinutes} > 0`),
    check(
      "experiences_max_group_size_positive",
      sql`${table.maxGroupSize} IS NULL OR ${table.maxGroupSize} > 0`,
    ),
    check(
      "experiences_price_unit_valid",
      sql`${table.priceUnit} IN (${sql.raw(PRICE_UNITS.map((u) => `'${u}'`).join(", "))})`,
    ),
  ],
);

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

export const visitRequestStatus = pgEnum(
  "visit_request_status",
  VISIT_REQUEST_STATUSES,
);

// Solicitudes de visita o cata. No son reservas: la bodega coordina la fecha a mano.
export const visitRequests = pgTable(
  "visit_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Se conserva el historial: un paquete con solicitudes no se puede borrar (desactivarlo sí).
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "restrict" }),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    // Texto libre ("Sábado 15 de marzo", "primera quincena de abril"): no hay agenda calendarizada.
    preferredDate: text("preferred_date").notNull(),
    groupSize: integer("group_size").notNull(),
    comments: text("comments"),
    status: visitRequestStatus("status").notNull().default("pendiente"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("visit_requests_group_size_positive", sql`${table.groupSize} > 0`),
    index("visit_requests_experience_id_idx").on(table.experienceId),
    index("visit_requests_status_idx").on(table.status),
  ],
);

export type VisitRequest = typeof visitRequests.$inferSelect;
export type NewVisitRequest = typeof visitRequests.$inferInsert;
export type { VisitRequestStatus };
