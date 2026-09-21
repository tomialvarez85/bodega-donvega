CREATE TYPE "public"."delivery_method" AS ENUM('envio', 'retiro');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pendiente', 'confirmado', 'entregado', 'cancelado');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name" text NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
-- Editado a mano: el ALTER TYPE directo falla con el DEFAULT text y con estados viejos (pagado/enviado).
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING (
	CASE "status"
		WHEN 'pagado' THEN 'confirmado'
		WHEN 'enviado' THEN 'confirmado'
		ELSE "status"
	END
)::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pendiente';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "number" integer NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "customer_phone" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_method" "delivery_method" DEFAULT 'retiro' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" text DEFAULT 'sin datos' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");