ALTER TABLE "products" ALTER COLUMN "price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_new_release" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "enologist" text DEFAULT 'Victor Vega' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "origin" text DEFAULT 'Tinogasta, Catamarca' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "altitude_masl" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "vineyard_since" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "irrigation" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "conduction" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "soil" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "alcohol_percentage" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "aging" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "bottles_produced" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tasting_sight" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tasting_nose" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tasting_palate" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "awards" jsonb DEFAULT '[]'::jsonb NOT NULL;