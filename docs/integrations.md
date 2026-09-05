# KisanLoop Integrations & Future Interoperability

KisanLoop is architected using the **Adapter Pattern** so that external national, state, and private agricultural services can be connected with zero impact on the application's core business logic.

---

## 1. Adapter Architecture
Every external service is accessed through a standardized TypeScript interface:

```text
External System (IMD / AgriStack / Sentinel / SoilGrids)
              ↓
      Normalized Adapter
              ↓
  Normalized KisanLoop Domain Model
              ↓
      Farm State Engine
```

---

## 2. Integrated & Future Adapters

| Capability | Current Adapter | Future Production Adapter |
| :--- | :--- | :--- |
| **Weather & Radar** | `DemoWeatherAdapter` / `OpenWeatherAdapter` | IMD Mausam API & State Agro-Met Stations |
| **Soil Telemetry** | `DemoSoilAdapter` | Soil Health Card (SHC) API & SoilGrids |
| **Satellite Imagery** | `DemoSatelliteAdapter` (NDVI 0.72) | Sentinel-2 Hub & ISRO VEDAS / Bhuvan |
| **Pest Surveillance** | `DemoVisionAdapter` / `GeminiVisionAdapter` | National Pest Surveillance System (NPSS) |
| **Farmer Identity** | In-app Role Impersonator / Clerk | AgriStack Unified Farmer Service (UFS) |
| **Crop Survey** | In-app Cadastral Ingestion | Digital Crop Survey (DCS) Geo-Plots |
| **Advisories** | Verified ICAR Knowledge Chunks | Bharat-VISTAAR & KVK Advisory Feeds |

---

## 3. Future Cross-State Federation
The application's relational data model supports horizontal partition by:
- `state` (e.g. Jharkhand, Bihar, Odisha)
- `district` (e.g. Ranchi, Khunti, Hazaribagh)
- `agro_climatic_zone` (e.g. Zone VII: Eastern Plateau and Hills)

Future federated learning will allow states to share privacy-preserving model weights for pest and disease outbreaks without centralizing sensitive smallholder farmer registry records.
