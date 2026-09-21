ALTER TABLE "products" ADD COLUMN "is_on_sale" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sale_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sale_label" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sale_price_required" CHECK ("products"."is_on_sale" = false OR "products"."sale_price" IS NOT NULL);