CREATE TABLE "combo_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "combo_items_combo_product_unique" UNIQUE("combo_id","product_id"),
	CONSTRAINT "combo_items_quantity_positive" CHECK ("combo_items"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "combo_items_product_id_idx" ON "combo_items" USING btree ("product_id");