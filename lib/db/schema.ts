import {
  pgTable,
  text,
  varchar,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

// 1. Users table (Supports Farmer, Agricultural Expert, Admin/Government)
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("FARMER"), // 'FARMER' | 'EXPERT' | 'ADMIN'
  preferredLanguage: varchar("preferred_language", { length: 16 }).default("hi"), // 'hi' | 'en'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Farmers profile
export const farmers = pgTable("farmers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  state: varchar("state", { length: 100 }).notNull().default("Jharkhand"),
  district: varchar("district", { length: 100 }).notNull().default("Ranchi"),
  village: varchar("village", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 16 }).default("hi"),
  experienceYears: integer("experience_years").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Farms
export const farms = pgTable("farms", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmerId: varchar("farmer_id", { length: 64 }).references(() => farmers.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  totalAreaAcres: doublePrecision("total_area_acres").notNull().default(1.0),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  irrigationType: varchar("irrigation_type", { length: 64 }).default("Rainfed"), // 'Rainfed' | 'Borewell' | 'Canal' | 'Drip'
  soilType: varchar("soil_type", { length: 64 }).default("Loamy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Fields (with spatial polygon boundaries stored as GeoJSON / PostGIS)
export const fields = pgTable("fields", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  areaAcres: doublePrecision("area_acres").notNull(),
  boundaryGeoJson: jsonb("boundary_geojson"), // Polygon coordinates for PostGIS compatibility
  soilMoisturePercent: doublePrecision("soil_moisture_percent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Crops
export const crops = pgTable("crops", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fieldId: varchar("field_id", { length: 64 }).references(() => fields.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g. Paddy, Wheat, Maize
  variety: varchar("variety", { length: 100 }), // e.g. IR64, Swarna
  stage: varchar("stage", { length: 64 }).notNull().default("Vegetative"), // Sowing | Vegetative | Flowering | Ripening | Harvest
  sowingDate: timestamp("sowing_date"),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  status: varchar("status", { length: 32 }).default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Farm State Engine Snapshot
export const farmStates = pgTable("farm_states", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  cropId: varchar("crop_id", { length: 64 }).references(() => crops.id),
  cropName: varchar("crop_name", { length: 100 }),
  cropStage: varchar("crop_stage", { length: 64 }),
  soilMoisture: varchar("soil_moisture", { length: 32 }).default("adequate"), // dry | adequate | saturated
  rainRisk: varchar("rain_risk", { length: 32 }).default("low"), // low | moderate | high
  heatRisk: varchar("heat_risk", { length: 32 }).default("low"),
  pestRisk: varchar("pest_risk", { length: 32 }).default("low"),
  diseaseRisk: varchar("disease_risk", { length: 32 }).default("low"),
  overallRisk: varchar("overall_risk", { length: 32 }).default("low"), // low | medium | high
  summary: text("summary"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Weather Observations
export const weatherObservations = pgTable("weather_observations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  temperatureC: doublePrecision("temperature_c").notNull(),
  humidityPercent: integer("humidity_percent").notNull(),
  rainfallMm: doublePrecision("rainfall_mm").default(0),
  rainProbabilityPercent: integer("rain_probability_percent").default(0),
  windSpeedKmh: doublePrecision("wind_speed_kmh").default(0),
  condition: varchar("condition", { length: 100 }).notNull(),
  forecastDate: timestamp("forecast_date").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// 8. Soil Observations
export const soilObservations = pgTable("soil_observations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  nitrogenKgHa: doublePrecision("nitrogen_kg_ha"),
  phosphorusKgHa: doublePrecision("phosphorus_kg_ha"),
  potassiumKgHa: doublePrecision("potassium_kg_ha"),
  ph: doublePrecision("ph"),
  organicCarbonPercent: doublePrecision("organic_carbon_percent"),
  moisturePercent: doublePrecision("moisture_percent"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// 9. Satellite Observations (NDVI, NDWI)
export const satelliteObservations = pgTable("satellite_observations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  ndvi: doublePrecision("ndvi").notNull(), // Normalized Difference Vegetation Index (0.0 - 1.0)
  ndwi: doublePrecision("ndwi"), // Normalized Difference Water Index
  evi: doublePrecision("evi"), // Enhanced Vegetation Index
  coveragePercent: integer("coverage_percent").default(100),
  observationDate: timestamp("observation_date").notNull(),
  source: varchar("source", { length: 100 }).default("Sentinel-2 / Demo"),
});

// 10. Pest & Disease Observations (Computer Vision / Sensor)
export const pestObservations = pgTable("pest_observations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  cropId: varchar("crop_id", { length: 64 }).references(() => crops.id),
  pestOrDiseaseName: varchar("pest_or_disease_name", { length: 255 }).notNull(),
  confidenceScore: doublePrecision("confidence_score").notNull(), // 0.0 to 1.0
  symptoms: text("symptoms"),
  imageUrl: text("image_url"),
  severity: varchar("severity", { length: 32 }).default("MODERATE"), // LOW | MODERATE | HIGH
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

// 11. Risk Events detected by RiskEventEngine
export const riskEvents = pgTable("risk_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  riskType: varchar("risk_type", { length: 64 }).notNull(), // 'IRRIGATION' | 'PEST' | 'DISEASE' | 'WEATHER' | 'NUTRIENT'
  severity: varchar("severity", { length: 32 }).notNull().default("MEDIUM"), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"), // 'ACTIVE' | 'MITIGATED' | 'DISMISSED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Actionable Recommendations
export const recommendations = pgTable("recommendations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  cropId: varchar("crop_id", { length: 64 }).references(() => crops.id),
  riskEventId: varchar("risk_event_id", { length: 64 }).references(() => riskEvents.id),
  title: varchar("title", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  actionSummary: text("action_summary").notNull(),
  deadline: timestamp("deadline"),
  confidenceScore: doublePrecision("confidence_score").notNull().default(0.9),
  riskLevel: varchar("risk_level", { length: 32 }).default("low"),
  requiresExpertReview: boolean("requires_expert_review").default(false),
  isFeasible: boolean("is_feasible").default(true),
  alternativeAction: text("alternative_action"),
  status: varchar("status", { length: 32 }).default("ACTIVE"), // 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Recommendation Evidence (Passport Traceability)
export const recommendationEvidence = pgTable("recommendation_evidence", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recommendationId: varchar("recommendation_id", { length: 64 }).references(() => recommendations.id).notNull(),
  evidenceType: varchar("evidence_type", { length: 64 }).notNull(), // 'WEATHER' | 'SOIL' | 'SATELLITE' | 'VISION' | 'KNOWLEDGE_DOC'
  title: varchar("title", { length: 255 }).notNull(),
  details: text("details").notNull(),
  sourceDocumentId: varchar("source_document_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Farmer Actions
export const actions = pgTable("actions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recommendationId: varchar("recommendation_id", { length: 64 }).references(() => recommendations.id).notNull(),
  farmerId: varchar("farmer_id", { length: 64 }).references(() => farmers.id).notNull(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"), // 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'NOT_POSSIBLE' | 'EXPIRED'
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Adoption Barriers (When Action = NOT_POSSIBLE)
export const adoptionBarriers = pgTable("adoption_barriers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  actionId: varchar("action_id", { length: 64 }).references(() => actions.id).notNull(),
  farmerId: varchar("farmer_id", { length: 64 }).references(() => farmers.id).notNull(),
  barrierType: varchar("barrier_type", { length: 64 }).notNull(), 
  // 'TOO_EXPENSIVE' | 'INPUT_UNAVAILABLE' | 'DIDNT_UNDERSTAND' | 'NO_LABOUR' | 'NO_WATER' | 'NO_EQUIPMENT' | 'TIMING_ISSUE' | 'OTHER'
  notes: text("notes"),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
});

// 16. Measured Outcomes (Closing the feedback loop)
export const outcomes = pgTable("outcomes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  actionId: varchar("action_id", { length: 64 }).references(() => actions.id).notNull(),
  farmId: varchar("farm_id", { length: 64 }).references(() => farms.id).notNull(),
  cropId: varchar("crop_id", { length: 64 }).references(() => crops.id),
  beforeState: text("before_state"),
  afterState: text("after_state"),
  yieldImpact: varchar("yield_impact", { length: 64 }), // e.g. "+12% estimated"
  costSavingsInr: doublePrecision("cost_savings_inr").default(0),
  waterSavedLiters: doublePrecision("water_saved_liters").default(0),
  expertValidated: boolean("expert_validated").default(false),
  expertValidationNotes: text("expert_validation_notes"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// 17. Expert Reviews & Escalation Queue
export const expertReviews = pgTable("expert_reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recommendationId: varchar("recommendation_id", { length: 64 }).references(() => recommendations.id).notNull(),
  expertId: varchar("expert_id", { length: 64 }).references(() => users.id),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"), // 'PENDING' | 'APPROVED' | 'CORRECTED' | 'FOLLOW_UP_REQUESTED'
  expertNotes: text("expert_notes"),
  correctionDetails: text("correction_details"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 18. Knowledge & Research Documents (RAG)
export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 32 }).notNull(), // 'PDF' | 'DOCX' | 'TXT' | 'CSV'
  storageKey: text("storage_key").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  chunkCount: integer("chunk_count").default(0),
  status: varchar("status", { length: 32 }).default("READY"), // 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 19. Datasets Ingestion & Schema Mappings
export const datasets = pgTable("datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 32 }).notNull(), // 'CSV' | 'XLSX' | 'JSON'
  rowCount: integer("row_count").default(0),
  columnMapping: jsonb("column_mapping"), // { "col_lat": "latitude", "col_crop": "crop_name" }
  status: varchar("status", { length: 32 }).default("IMPORTED"), // 'UPLOADED' | 'VALIDATED' | 'IMPORTED' | 'FAILED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 20. Audit Logs & Explainability Trail
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 64 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
