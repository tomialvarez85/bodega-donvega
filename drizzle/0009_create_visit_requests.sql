CREATE TYPE "public"."visit_request_status" AS ENUM('pendiente', 'confirmado', 'cancelado');--> statement-breakpoint
CREATE TABLE "visit_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experience_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"preferred_date" text NOT NULL,
	"group_size" integer NOT NULL,
	"comments" text,
	"status" "visit_request_status" DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visit_requests_group_size_positive" CHECK ("visit_requests"."group_size" > 0)
);
--> statement-breakpoint
ALTER TABLE "visit_requests" ADD CONSTRAINT "visit_requests_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visit_requests_experience_id_idx" ON "visit_requests" USING btree ("experience_id");--> statement-breakpoint
CREATE INDEX "visit_requests_status_idx" ON "visit_requests" USING btree ("status");