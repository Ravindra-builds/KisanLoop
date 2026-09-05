CREATE TABLE "actions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"recommendation_id" varchar(64) NOT NULL,
	"farmer_id" varchar(64) NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"deadline" timestamp,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_barriers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"action_id" varchar(64) NOT NULL,
	"farmer_id" varchar(64) NOT NULL,
	"barrier_type" varchar(64) NOT NULL,
	"notes" text,
	"reported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" varchar(64) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"field_id" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"variety" varchar(100),
	"stage" varchar(64) DEFAULT 'Vegetative' NOT NULL,
	"sowing_date" timestamp,
	"expected_harvest_date" timestamp,
	"status" varchar(32) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_type" varchar(32) NOT NULL,
	"row_count" integer DEFAULT 0,
	"column_mapping" jsonb,
	"status" varchar(32) DEFAULT 'IMPORTED',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expert_reviews" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"recommendation_id" varchar(64) NOT NULL,
	"expert_id" varchar(64),
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"expert_notes" text,
	"correction_details" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_states" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"crop_id" varchar(64),
	"crop_name" varchar(100),
	"crop_stage" varchar(64),
	"soil_moisture" varchar(32) DEFAULT 'adequate',
	"rain_risk" varchar(32) DEFAULT 'low',
	"heat_risk" varchar(32) DEFAULT 'low',
	"pest_risk" varchar(32) DEFAULT 'low',
	"disease_risk" varchar(32) DEFAULT 'low',
	"overall_risk" varchar(32) DEFAULT 'low',
	"summary" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64),
	"name" varchar(255) NOT NULL,
	"phone" varchar(32),
	"state" varchar(100) DEFAULT 'Jharkhand' NOT NULL,
	"district" varchar(100) DEFAULT 'Ranchi' NOT NULL,
	"village" varchar(100),
	"preferred_language" varchar(16) DEFAULT 'hi',
	"experience_years" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farmer_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_area_acres" double precision DEFAULT 1 NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"irrigation_type" varchar(64) DEFAULT 'Rainfed',
	"soil_type" varchar(64) DEFAULT 'Loamy',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"area_acres" double precision NOT NULL,
	"boundary_geojson" jsonb,
	"soil_moisture_percent" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_type" varchar(32) NOT NULL,
	"storage_key" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"chunk_count" integer DEFAULT 0,
	"status" varchar(32) DEFAULT 'READY',
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcomes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"action_id" varchar(64) NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"crop_id" varchar(64),
	"before_state" text,
	"after_state" text,
	"yield_impact" varchar(64),
	"cost_savings_inr" double precision DEFAULT 0,
	"water_saved_liters" double precision DEFAULT 0,
	"expert_validated" boolean DEFAULT false,
	"expert_validation_notes" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_observations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"crop_id" varchar(64),
	"pest_or_disease_name" varchar(255) NOT NULL,
	"confidence_score" double precision NOT NULL,
	"symptoms" text,
	"image_url" text,
	"severity" varchar(32) DEFAULT 'MODERATE',
	"detected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_evidence" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"recommendation_id" varchar(64) NOT NULL,
	"evidence_type" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"details" text NOT NULL,
	"source_document_id" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"crop_id" varchar(64),
	"risk_event_id" varchar(64),
	"title" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"action_summary" text NOT NULL,
	"deadline" timestamp,
	"confidence_score" double precision DEFAULT 0.9 NOT NULL,
	"risk_level" varchar(32) DEFAULT 'low',
	"requires_expert_review" boolean DEFAULT false,
	"is_feasible" boolean DEFAULT true,
	"alternative_action" text,
	"status" varchar(32) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"risk_type" varchar(64) NOT NULL,
	"severity" varchar(32) DEFAULT 'MEDIUM' NOT NULL,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "satellite_observations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"ndvi" double precision NOT NULL,
	"ndwi" double precision,
	"evi" double precision,
	"coverage_percent" integer DEFAULT 100,
	"observation_date" timestamp NOT NULL,
	"source" varchar(100) DEFAULT 'Sentinel-2 / Demo'
);
--> statement-breakpoint
CREATE TABLE "soil_observations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"nitrogen_kg_ha" double precision,
	"phosphorus_kg_ha" double precision,
	"potassium_kg_ha" double precision,
	"ph" double precision,
	"organic_carbon_percent" double precision,
	"moisture_percent" double precision,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'FARMER' NOT NULL,
	"preferred_language" varchar(16) DEFAULT 'hi',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weather_observations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"farm_id" varchar(64) NOT NULL,
	"temperature_c" double precision NOT NULL,
	"humidity_percent" integer NOT NULL,
	"rainfall_mm" double precision DEFAULT 0,
	"rain_probability_percent" integer DEFAULT 0,
	"wind_speed_kmh" double precision DEFAULT 0,
	"condition" varchar(100) NOT NULL,
	"forecast_date" timestamp NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_barriers" ADD CONSTRAINT "adoption_barriers_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_barriers" ADD CONSTRAINT "adoption_barriers_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_reviews" ADD CONSTRAINT "expert_reviews_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_reviews" ADD CONSTRAINT "expert_reviews_expert_id_users_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_states" ADD CONSTRAINT "farm_states_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_states" ADD CONSTRAINT "farm_states_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_observations" ADD CONSTRAINT "pest_observations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_observations" ADD CONSTRAINT "pest_observations_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_evidence" ADD CONSTRAINT "recommendation_evidence_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_risk_event_id_risk_events_id_fk" FOREIGN KEY ("risk_event_id") REFERENCES "public"."risk_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_observations" ADD CONSTRAINT "satellite_observations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_observations" ADD CONSTRAINT "soil_observations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_observations" ADD CONSTRAINT "weather_observations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;