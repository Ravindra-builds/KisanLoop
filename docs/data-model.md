# KisanLoop Data Model & Entity Relations

KisanLoop uses a normalized relational architecture with PostgreSQL, PostGIS spatial data, and Qdrant vector indexing.

```
users (FARMER, EXPERT, ADMIN)
  └── farmers
        └── farms (Geo Coordinates, Area, Soil Type)
              ├── fields (Boundary GeoJSON / PostGIS Polygon)
              │     └── crops (IR-64 Paddy, Vegetative Stage)
              ├── farm_states (Normalized State, Soil Moisture, Risk Index)
              ├── weather_observations (Rainfall, Temp, Humidity, Radar Pop)
              ├── soil_observations (NPK, pH, Moisture Volumetric)
              ├── satellite_observations (NDVI, NDWI, Sentinel-2)
              ├── pest_observations (Vision Diagnosis, Symptoms, Severity)
              ├── risk_events (Irrigation, Fungal, Weather Triggers)
              └── recommendations
                    ├── recommendation_evidence (Traceability Links)
                    ├── actions (Status: PENDING, COMPLETED, NOT_POSSIBLE)
                    │     ├── adoption_barriers (Reason: Stockout, Capital, Labour)
                    │     └── outcomes (Yield Impact, Water Saved, Cost Saved)
                    └── expert_reviews (Status: APPROVED, CORRECTED, FOLLOW_UP)

knowledge_documents (RAG Documents: PDF, DOCX, CSV)
datasets (Cadastral / Crop Survey Ingestion & Column Mappings)
audit_logs (Full Regulatory & Explainability Trail)
```
