# 🌾 KisanLoop: Setup & Deployment Guide

> **"From Agricultural Intelligence to Agricultural Action"**  
> KisanLoop is an action, feasibility, adoption, and outcome intelligence platform connecting satellite telemetry, radar predictions, and soil sensors into personalized, verified farm decisions for Indian smallholders.

---

## 📑 Table of Contents
1. [System Prerequisites](#1-system-prerequisites)
2. [Quickstart (30-Second Demo Setup)](#2-quickstart-30-second-demo-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [Role-Based Portals & Territory Separation](#4-role-based-portals--territory-separation)
5. [Demo Mode vs Production Mode (DEMO_MODE)](#5-demo-mode-vs-production-mode-demo_mode)
6. [Pre-Configured Test Accounts](#6-pre-configured-test-accounts)
7. [Running Tests & Linting](#7-running-tests--linting)
8. [Connecting Real Cloud Services & Database Migrations (Production Ready)](#8-connecting-real-cloud-services--database-migrations-production-ready)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. System Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `v20.x`, `v22.x`, or `v24.x` (Recommended: Node 20+ LTS)
- **Package Manager**: `pnpm` (`v9.x` or `v10.x`/`v11.x`) or `npm`
- **Operating System**: Windows, macOS, or Linux
- **Modern Web Browser**: Chrome, Edge, or Firefox (with Web Speech API support for Hindi/English voice interaction)

Verify versions:
```bash
node -v
pnpm -v
```

---

## 2. Quickstart (30-Second Demo Setup)

Clone the repository and launch the application instantly in zero-config offline Demo Mode:

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd KisanLOOP-Anti

# 2. Install dependencies
pnpm install

# 3. Copy environment configuration
cp .env.example .env.local

# 4. Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
By default, **`DEMO_MODE=true`**, which gives immediate, seamless access to the Hero Farmer Portal (**Ravi Kumar**, Namkum, Ranchi) with deterministic mock databases and real-time offline AI adapters.

---

## 3. Environment Configuration

All environment variables are documented with clear defaults in [.env.example](.env.example) and loaded from [.env.local](.env.local).

### Core Switch
`env
# DEMO_MODE=true  -> Bypass authentication, use in-memory store & simulated telemetry (ideal for demos)
# DEMO_MODE=false -> Enforce authentication, role territory guards, and live database/AI connections
DEMO_MODE=true
NODE_ENV=development
`

---

## 4. Role-Based Portals & Territory Separation

KisanLoop isolates user roles into four separate, purpose-built portals so that users cannot enter each other\'s territory:

| Portal | Route | Primary Audience | Key Functionality |
| :--- | :--- | :--- | :--- |
| **🌾 Farmer Portal** | / | Smallholder Farmers (e.g., Ravi Kumar) | Mobile-first app interface, Today\'s Action, Voice Audio in Hindi, Crop Disease Vision, Adoption Barrier modal, Recommendation Passport. |
| **🔬 Expert Review Desk** | /expert | KVK Scientists & Agronomists (Dr. K. Patel) | Escalated low-confidence AI cases queue, evidence inspection, 1-click Approve/Correct/Follow-up actions. |
| **🏛 Government Dashboard** | /dashboard | District Agri Officers & Policy Makers | Real-time Actionable Advisory Rate (AAR), Adoption Funnel, Regional Barrier Distribution, PostGIS interactive GIS map. |
| **💾 Knowledge & Data Admin** | /admin | Extension Administrators & Data Engineers | Agricultural guideline document parser (RAG Qdrant sync), CSV/Excel dataset ingestion with field mapping, system reset. |

---

## 5. Demo Mode vs Production Mode (DEMO_MODE)

KisanLoop features a single master switch controlling the entire application behavior:

### A. Demo Mode (DEMO_MODE=true - Default)
- **Direct Portal Access**: No login required.
- **In-Memory Mock Database**: Persists actions, barriers, diagnosis logs, and expert reviews during the session.
- **Hero Farmer**: Seeded with **Ravi Kumar** (1.2-acre paddy plot, Namkum, Ranchi, Jharkhand).
- **Simulated Telemetry**: IMD rainfall radar probability, soil moisture sensor, and ICAR guidelines work offline.
- **Reset Button**: Reset Demo State in the admin desk and shared navigation resets all mock data back to the clean baseline.

### B. Production Mode (DEMO_MODE=false)
- **Strict Authentication Guard**: Anyone visiting /, /expert, /dashboard, or /admin is automatically redirected to /login.
- **Role Territory Enforcement**:
  - FARMER trying to access /expert, /dashboard, or /admin is blocked and redirected back to /.
  - EXPERT trying to access / or /dashboard is redirected to /expert.
  - GOVT trying to access / or /expert is redirected to /dashboard.
- **Pre-Configured Test Accounts**: One-click test logins remain available on /login for seamless evaluator inspection even in production mode.
- **Database & External APIs**: Automatically connects to Neon PostgreSQL, Upstash Redis, Qdrant Cloud, and Google Gemini if environment variables are populated.

To switch to Production Mode:
1. Open .env.local.
2. Change DEMO_MODE=true to DEMO_MODE=false.
3. Restart dev server: pnpm dev.
4. Navigate to http://localhost:3000 -> You will be directed to /login.

---

## 6. Pre-Configured Test Accounts

Even in production mode (`DEMO_MODE=false`), four test accounts are available on the `/login` screen:

| Role | Name & Title | Email | Password | Landing Route |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Ravi Kumar (रवि कुमार) | `ravi.kumar@kisanloop.org` | `Farmer@123` | `/` |
| **Expert** | Dr. K. Patel (Agronomist) | `dr.patel@kvk-ranchi.org` | `Expert@123` | `/expert` |
| **Government** | Ramesh Kumar (DAO Ranchi) | `dao.ranchi@jharkhand.gov.in` | `Govt@123` | `/dashboard` |
| **Admin** | System Administrator | `admin@kisanloop.org` | `Admin@123` | `/admin` |

To sign out from any portal, click the **Sign Out** icon located beside your user card in the desktop sidebar or header.

---

## 7. Running Tests & CLI Commands

KisanLoop includes automated test suites, build scripts, and Drizzle database tools:

```bash
# Run unit tests
pnpm test

# Run Next.js production build test
pnpm run build

# Push database schema to PostgreSQL + PostGIS
pnpm run db:push

# Open visual Drizzle Studio database browser
pnpm run db:studio

# Run linter
pnpm run lint
```

---

## 8. Connecting Real Cloud Services & Database Migrations (Production Ready)

To connect live production services, simply supply the credentials in `.env.local` and set `DEMO_MODE=false`.

### 1. Database Setup & PostGIS Schema Migrations (Drizzle ORM)
KisanLoop includes a complete 20-table schema (`lib/db/schema.ts`) with PostGIS spatial polygon compatibility for farm fields and regional risk contours.

1. **Create Database**: Create a serverless PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. **Enable PostGIS**: In your Neon SQL Editor / query tool, execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. **Configure Connection**: Add your connection string to `.env.local`:
   ```env
   DATABASE_URL=postgres://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/kisanloop?sslmode=require
   ```
4. **Push Schema to Database (Zero-Downtime)**:
   ```bash
   pnpm run db:push
   ```
   *Drizzle Kit will read `lib/db/schema.ts` and synchronize all 20 tables (`users`, `farmers`, `farms`, `fields`, `recommendations`, `actions`, `adoption_barriers`, `outcomes`, etc.) directly to your database.*
5. **Inspect Tables Visually**:
   ```bash
   pnpm run db:studio
   ```
   *Opens Drizzle Studio locally at `https://local.drizzle.team` to inspect live data.*
6. **Generate SQL Migration Files (Optional for Git history)**:
   ```bash
   pnpm run db:generate
   ```

### 2. Cache & Rate Limiting (Upstash Redis)
1. Create a serverless Redis database on [Upstash](https://upstash.com).
2. Set in `.env.local`:
   ```env
   REDIS_URL=https://cool-tiger-12345.upstash.io
   REDIS_TOKEN=your_upstash_rest_token
   ```
3. **Behavior**: `cacheProvider` (`lib/providers/cache.ts`) automatically uses Upstash REST API. If keys are missing or offline, it seamlessly falls back to high-performance in-memory caching.

### 3. Vector Database (Qdrant Cloud RAG)
1. Create a cluster on [Qdrant Cloud](https://cloud.qdrant.io).
2. Set in `.env.local`:
   ```env
   QDRANT_URL=https://xyz-example.eu-central.aws.cloud.qdrant.io:6333
   QDRANT_API_KEY=your_qdrant_api_key
   ```
3. **Behavior**: `vectorProvider` (`lib/providers/vector.ts`) automatically provisions the `kisanloop_knowledge` collection (Cosine distance, 768-dim) and indexes agricultural research papers. If unreachable, it falls back to the in-memory RAG vector index.

### 4. Object Storage (Cloudflare R2)
1. Create a bucket on [Cloudflare R2](https://dash.cloudflare.com) (S3-compatible).
2. Set in `.env.local`:
   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET=kisanloop-uploads
   R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
   ```
3. **Behavior**: `storageProvider` (`lib/providers/storage.ts`) uploads documents (PDF, DOCX, CSV) and plant leaf photos directly to R2. If credentials are empty, it gracefully saves files under `public/uploads/`.

### 5. Weather Telemetry (OpenWeather API)
1. Sign up on [OpenWeatherMap](https://openweathermap.org/api) and generate an API key.
2. Set in `.env.local`:
   ```env
   WEATHER_PROVIDER=openweather
   WEATHER_API_KEY=your_openweather_api_key
   ```
3. **Behavior**: `weatherProvider` (`lib/providers/weather.ts`) fetches real-time 5-day / 3-hour precipitation probability and rainfall (mm) for Ravi Kumar's farm coordinates (`23.3441° N, 85.3096° E`). If API limits are exceeded, it falls back to the Ranchi Monsoon Radar model.

### 6. Generative AI & Vision (Google Gemini 1.5 Flash / OpenAI)
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/) or [OpenAI Platform](https://platform.openai.com/).
2. Set in `.env.local`:
   ```env
   AI_PROVIDER=google
   AI_MODEL=gemini-1.5-flash
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   VISION_PROVIDER=google
   VISION_API_KEY=your_gemini_api_key
   ```
3. **Behavior**: Powers real-time bilingual chat (`/api/chat`) and leaf blast diagnosis (`/api/vision/analyze`). Falls back to deterministic agronomic guidelines if offline.

### 7. Voice Interaction (Web Speech API)
- Set `STT_PROVIDER=web` and `TTS_PROVIDER=web`.
- Uses native browser speech synthesis and recognition (`hi-IN` and `en-IN`) with zero API charges.

### 8. Soil & Satellite Telemetry
- Currently operates in high-fidelity demo mode (`SOIL_PROVIDER=demo`, `SATELLITE_PROVIDER=demo`) simulating precision NPK, pH 6.4, 68.5% soil moisture, and Sentinel-2 NDVI 0.72 vegetation health. Ready for live Copernicus and SoilGrids API ingestion when adapters are added.

---

## 9. Troubleshooting & FAQ

### Q1: The leaf disease scanner or voice speaker is not playing sound.
- **Audio/Voice**: Modern browsers require user interaction before playing speech synthesizer audio. Click the Listen (सुनें) button on any recommendation card.
- **Permissions**: Ensure your browser allows microphone access if testing voice input in the Ask AI tab.

### Q2: I want to reset the database to the original state.
- Navigate to /admin and click **Reset Demo State**, or click the reset button on any portal header. This resets all recommendations, actions, and test data back to Ravi Kumar\'s original state.

### Q3: How do I test the mobile view on desktop?
- Open DevTools (F12 or Ctrl+Shift+I), toggle Device Toolbar (Ctrl+Shift+M), and select iPhone 12/14 Pro. Notice how the desktop sidebar smoothly transforms into a native mobile app bottom navigation bar.

---

**Built for HackQuest: Code for Communities 2.0 • Problem Statement 04: Agricultural Intelligence**
