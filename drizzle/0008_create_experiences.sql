CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"price_unit" text DEFAULT 'por persona' NOT NULL,
	"max_group_size" integer,
	"image_url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_slug_unique" UNIQUE("slug"),
	CONSTRAINT "experiences_duration_positive" CHECK ("experiences"."duration_minutes" > 0),
	CONSTRAINT "experiences_max_group_size_positive" CHECK ("experiences"."max_group_size" IS NULL OR "experiences"."max_group_size" > 0),
	CONSTRAINT "experiences_price_unit_valid" CHECK ("experiences"."price_unit" IN ('por persona', 'por grupo'))
);
