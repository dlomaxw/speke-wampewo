CREATE TABLE "amenities" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'in-apartment' NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"session_ref" text,
	"path" text,
	"dedupe_key" text,
	"value" integer,
	"currency" text,
	"utm" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_email" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"day" date NOT NULL,
	"units_blocked" integer DEFAULT 0 NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "booking_amendments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested" jsonb,
	"policy_outcome" text,
	"penalty_minor" integer DEFAULT 0 NOT NULL,
	"decided_by" text,
	"decided_at" timestamp with time zone,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"actor" text DEFAULT 'system' NOT NULL,
	"note" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_extras" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"extra_id" text,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"room_type_id" text NOT NULL,
	"rate_plan_id" text,
	"unit_id" text,
	"room_type_name" text NOT NULL,
	"rate_plan_name" text,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"subtotal_minor" integer DEFAULT 0 NOT NULL,
	"nightly" jsonb
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"mode" text DEFAULT 'request' NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"nights" integer NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"child_ages" jsonb,
	"rooms" integer DEFAULT 1 NOT NULL,
	"guest_first_name" text NOT NULL,
	"guest_last_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text,
	"guest_country" text,
	"company_name" text,
	"special_requests" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"accommodation_minor" integer DEFAULT 0 NOT NULL,
	"extras_minor" integer DEFAULT 0 NOT NULL,
	"discount_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer DEFAULT 0 NOT NULL,
	"deposit_due_minor" integer DEFAULT 0 NOT NULL,
	"paid_minor" integer DEFAULT 0 NOT NULL,
	"refunded_minor" integer DEFAULT 0 NOT NULL,
	"price_breakdown" jsonb,
	"promo_code" text,
	"cancellation_policy_id" text,
	"cancellation_summary" text,
	"source" text DEFAULT 'website' NOT NULL,
	"utm" jsonb,
	"manage_token_hash" text,
	"manage_token_expires_at" timestamp with time zone,
	"whatsapp_opt_in" boolean DEFAULT false NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cancellation_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"free_cancel_cutoff_hours" integer,
	"penalty_percent" integer DEFAULT 100 NOT NULL,
	"non_refundable" boolean DEFAULT false NOT NULL,
	"amendment_requires_approval" boolean DEFAULT true NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"country" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"negotiated_rate_notes" text,
	"account_manager_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_email" text,
	"subject_phone" text,
	"channel" text NOT NULL,
	"granted" boolean NOT NULL,
	"source_page" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phone" text,
	"phone_e164" text,
	"email" text,
	"whatsapp_e164" text,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"hours" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distances" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"detail" text NOT NULL,
	"minutes" integer,
	"kilometres" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extras" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_minor" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"pricing_mode" text DEFAULT 'per_stay' NOT NULL,
	"department_key" text,
	"taxable" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"category" text DEFAULT 'property' NOT NULL,
	"width" integer,
	"height" integer,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guides" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"image" text,
	"category" text DEFAULT 'kampala' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_holds" (
	"id" text PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"rooms" integer DEFAULT 1 NOT NULL,
	"session_ref" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_by_booking_id" text,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"type" text NOT NULL,
	"body" text,
	"actor_id" text,
	"actor_name" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"title" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"assigned_to" text,
	"status" text DEFAULT 'open' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"pipeline_key" text DEFAULT 'accommodation' NOT NULL,
	"stage" text DEFAULT 'new' NOT NULL,
	"outcome" text DEFAULT 'open' NOT NULL,
	"lost_reason" text,
	"enquiry_type" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone" text,
	"country" text,
	"company_id" text,
	"company_name" text,
	"check_in" date,
	"check_out" date,
	"adults" integer,
	"children" integer,
	"preferred_room_type_id" text,
	"message" text,
	"source" text DEFAULT 'website' NOT NULL,
	"source_detail" text,
	"department_key" text DEFAULT 'reservations' NOT NULL,
	"utm" jsonb,
	"assigned_to" text,
	"next_action_at" timestamp with time zone,
	"next_action" text,
	"booking_id" text,
	"dedupe_hash" text,
	"duplicate_of_id" text,
	"consent_marketing" boolean DEFAULT false NOT NULL,
	"consent_whatsapp" boolean DEFAULT false NOT NULL,
	"consent_recorded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"mime_type" text,
	"bytes" integer,
	"width" integer,
	"height" integer,
	"category" text,
	"source_url" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"channel" text NOT NULL,
	"name" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"provider_template_name" text,
	"approval_status" text DEFAULT 'draft' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'accommodation' NOT NULL,
	"summary" text,
	"description" text,
	"inclusions" jsonb,
	"terms" text,
	"image" text,
	"promo_code" text,
	"valid_from" date,
	"valid_to" date,
	"book_by_date" date,
	"department_key" text,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbound_emails" (
	"id" text PRIMARY KEY NOT NULL,
	"to_email" text NOT NULL,
	"template_key" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"related_entity" text,
	"related_id" text,
	"dedupe_key" text,
	"error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"blocks" jsonb,
	"hero_image" text,
	"intro" text,
	"department_key" text,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"noindex" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"payment_id" text,
	"type" text,
	"signature_valid" boolean DEFAULT false NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processing_error" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text,
	"provider" text NOT NULL,
	"method" text,
	"idempotency_key" text NOT NULL,
	"provider_reference" text,
	"status" text DEFAULT 'initiated' NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"settlement_currency" text,
	"settlement_amount_minor" integer,
	"purpose" text DEFAULT 'deposit' NOT NULL,
	"checkout_url" text,
	"failure_reason" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"stages" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"valid_from" date,
	"valid_to" date,
	"stay_from" date,
	"stay_to" date,
	"min_nights" integer DEFAULT 1 NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"per_guest_limit" integer,
	"applies_to_room_type_ids" jsonb,
	"active" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"tagline" text,
	"description" text,
	"address_line" text,
	"city" text,
	"country" text,
	"latitude" text,
	"longitude" text,
	"map_embed_url" text,
	"check_in_time" text,
	"check_out_time" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'Africa/Kampala' NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"lead_id" text,
	"company_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"subtotal_minor" integer DEFAULT 0 NOT NULL,
	"discount_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer DEFAULT 0 NOT NULL,
	"valid_until" date,
	"notes" text,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_by" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_calendar" (
	"id" serial PRIMARY KEY NOT NULL,
	"rate_plan_id" text NOT NULL,
	"day" date NOT NULL,
	"rate_minor" integer,
	"min_stay" integer,
	"closed" boolean DEFAULT false NOT NULL,
	"closed_to_arrival" boolean DEFAULT false NOT NULL,
	"closed_to_departure" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"base_rate_minor" integer NOT NULL,
	"min_stay" integer DEFAULT 1 NOT NULL,
	"max_stay" integer,
	"includes_breakfast" boolean DEFAULT false NOT NULL,
	"cancellation_policy_id" text,
	"deposit_percent" integer DEFAULT 0 NOT NULL,
	"extra_adult_minor" integer DEFAULT 0 NOT NULL,
	"extra_child_minor" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_path" text NOT NULL,
	"to_path" text NOT NULL,
	"status_code" integer DEFAULT 301 NOT NULL,
	"note" text,
	"hits" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"booking_id" text,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_reference" text,
	"requested_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_type_amenities" (
	"room_type_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "room_type_amenities_room_type_id_amenity_id_pk" PRIMARY KEY("room_type_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "room_type_images" (
	"id" text PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"width" integer,
	"height" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"bedrooms" integer,
	"bathrooms" integer,
	"max_adults" integer,
	"max_children" integer,
	"max_occupancy" integer,
	"size_sqm" integer,
	"bed_configuration" text,
	"kitchen_details" text,
	"bathroom_details" text,
	"living_details" text,
	"accessibility_notes" text,
	"floorplan_url" text,
	"virtual_tour_url" text,
	"hero_image" text,
	"from_price_minor" integer,
	"from_price_currency" text DEFAULT 'USD',
	"total_units" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"verification_notes" jsonb,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" text,
	"user_agent" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb,
	"description" text,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"rate_bps" integer NOT NULL,
	"applies_to" text DEFAULT 'accommodation' NOT NULL,
	"inclusive" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_name" text NOT NULL,
	"quote" text NOT NULL,
	"rating" integer,
	"stay_date" date,
	"source_platform" text NOT NULL,
	"source_url" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"verification" text DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" text PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"code" text NOT NULL,
	"floor" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"mfa_secret" text,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"wa_id" text NOT NULL,
	"display_name" text,
	"lead_id" text,
	"booking_id" text,
	"opted_in" boolean DEFAULT false NOT NULL,
	"opted_in_at" timestamp with time zone,
	"opted_out_at" timestamp with time zone,
	"assigned_to" text,
	"human_takeover" boolean DEFAULT false NOT NULL,
	"last_inbound_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text,
	"direction" text NOT NULL,
	"provider_message_id" text,
	"template_name" text,
	"body" text,
	"status" text,
	"failure_reason" text,
	"dedupe_key" text,
	"sent_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availability_overrides" ADD CONSTRAINT "availability_overrides_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_amendments" ADD CONSTRAINT "booking_amendments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_extras" ADD CONSTRAINT "booking_extras_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_rooms" ADD CONSTRAINT "booking_rooms_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_holds" ADD CONSTRAINT "inventory_holds_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_tasks" ADD CONSTRAINT "lead_tasks_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_calendar" ADD CONSTRAINT "rate_calendar_rate_plan_id_rate_plans_id_fk" FOREIGN KEY ("rate_plan_id") REFERENCES "public"."rate_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_type_amenities" ADD CONSTRAINT "room_type_amenities_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_type_amenities" ADD CONSTRAINT "room_type_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_type_images" ADD CONSTRAINT "room_type_images_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_contact_id_whatsapp_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."whatsapp_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "amenities_key_idx" ON "amenities" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_dedupe_idx" ON "analytics_events" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "analytics_name_idx" ON "analytics_events" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "avail_override_idx" ON "availability_overrides" USING btree ("room_type_id","day");--> statement-breakpoint
CREATE INDEX "amendments_booking_idx" ON "booking_amendments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_events_booking_idx" ON "booking_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_extras_booking_idx" ON "booking_extras" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_rooms_booking_idx" ON "booking_rooms" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_ref_idx" ON "bookings" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_dates_idx" ON "bookings" USING btree ("check_in","check_out");--> statement-breakpoint
CREATE INDEX "bookings_email_idx" ON "bookings" USING btree ("guest_email");--> statement-breakpoint
CREATE UNIQUE INDEX "cancel_policies_code_idx" ON "cancellation_policies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "consent_subject_idx" ON "consent_records" USING btree ("subject_email");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_key_idx" ON "departments" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "extras_code_idx" ON "extras" USING btree ("code");--> statement-breakpoint
CREATE INDEX "gallery_category_idx" ON "gallery_images" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "holds_rt_dates_idx" ON "inventory_holds" USING btree ("room_type_id","check_in","check_out");--> statement-breakpoint
CREATE INDEX "holds_expiry_idx" ON "inventory_holds" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "holds_session_idx" ON "inventory_holds" USING btree ("session_ref");--> statement-breakpoint
CREATE INDEX "lead_activities_lead_idx" ON "lead_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_tasks_due_idx" ON "lead_tasks" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "lead_tasks_lead_idx" ON "lead_tasks" USING btree ("lead_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_ref_idx" ON "leads" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "leads_stage_idx" ON "leads" USING btree ("pipeline_key","stage");--> statement-breakpoint
CREATE INDEX "leads_assigned_idx" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "leads_dedupe_idx" ON "leads" USING btree ("dedupe_hash");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_category_idx" ON "media_assets" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "templates_key_channel_idx" ON "message_templates" USING btree ("key","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "offers_slug_idx" ON "offers" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "emails_dedupe_idx" ON "outbound_emails" USING btree ("dedupe_key");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_unique_idx" ON "payment_events" USING btree ("provider","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_idem_idx" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_provider_ref_idx" ON "payments" USING btree ("provider","provider_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "pipelines_key_idx" ON "pipelines" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "promo_code_idx" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "property_slug_idx" ON "property" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "quote_lines_quote_idx" ON "quotation_lines" USING btree ("quotation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quotations_ref_idx" ON "quotations" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_cal_plan_day_idx" ON "rate_calendar" USING btree ("rate_plan_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_plans_code_idx" ON "rate_plans" USING btree ("code");--> statement-breakpoint
CREATE INDEX "rate_plans_rt_idx" ON "rate_plans" USING btree ("room_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from_path");--> statement-breakpoint
CREATE INDEX "refunds_payment_idx" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "rt_images_rt_idx" ON "room_type_images" USING btree ("room_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_types_slug_idx" ON "room_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "taxes_code_idx" ON "taxes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "units_code_idx" ON "units" USING btree ("code");--> statement-breakpoint
CREATE INDEX "units_rt_idx" ON "units" USING btree ("room_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "wa_contacts_waid_idx" ON "whatsapp_contacts" USING btree ("wa_id");--> statement-breakpoint
CREATE INDEX "wa_messages_contact_idx" ON "whatsapp_messages" USING btree ("contact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wa_messages_dedupe_idx" ON "whatsapp_messages" USING btree ("dedupe_key");