# 🌱 KisanLoop: Agricultural Action Platform

> **From Agricultural Intelligence to Agricultural Action**  

---

## 🌾 1. What is KisanLoop?
**KisanLoop** is an action, feasibility, adoption, and outcome intelligence platform connecting agricultural data directly to real-world farmer decisions.

Rather than being a generic chatbot or passive weather dashboard, KisanLoop closes the agricultural feedback loop:
```text
DETECT → UNDERSTAND → RECOMMEND → CHECK FEASIBILITY → ACT → VERIFY → LEARN
```

---

## 🎯 2. The Core Problem We Solve
Existing agricultural systems provide data, but extension teams rarely know:
1. **Actionability**: What exact action should a smallholder farmer take on their specific plot today?
2. **Feasibility**: Can the farmer realistically afford the recommendation or find inputs in their village?
3. **Adoption**: Did the farmer actually execute the action, or what barrier stopped them?
4. **Outcome**: Did the action conserve water, reduce expenses, or safeguard crop yields?

KisanLoop solves this with:
- **Context-Enriched Farmer Actions**
- **Feasibility Engine** (Validates cost, labor, water, and local input availability; suggests safe organic alternatives like NSKE 5% neem extract)
- **Adoption Tracking & Barrier Analysis** (One-touch "Done" or "I couldn't do this" feedback)
- **Recommendation Passport** (End-to-end traceability of sensor telemetry, weather models, and outcomes)
- **Closed-Loop Outcome Engine** (Connects verified field outcomes back into continuous learning)

---

## 🏛️ 3. Territory-Separated Portals & Navigation

KisanLoop strictly separates role territories to prevent cross-contamination:

### 1. Farmer Portal (`/`)
- **Desktop & Tablet (`md` and `lg`)**: Clean left **Sidebar** menu.
- **Mobile / Phone**: Native-app **Bottom Navigation Bar** with large touch targets.
- **Views**:
  - 🏠 **Today's Action (आज का काम)**: Ravi Kumar's farm signals, primary advisory with one-touch **Done**, **I couldn't do this** (Adoption Barrier Modal), and **Listen** (Hindi Audio TTS).
  - 🌾 **My Farm (मेरा खेत)**: 1.2-acre plot details, soil health test data (NPK, pH), Sentinel-2 satellite NDVI vegetation index.
  - 💬 **Ask AI (किसान मित्र)**: Bi-directional speech and text assistant grounded in real-time farm sensor data.
  - 📸 **Check Crop (फसल जांच)**: Smartphone photo disease diagnosis (*Paddy Leaf Blast*), feasibility check, and KVK escalation.
  - 📋 **Actions & Outcomes (कदम और परिणाम)**: Full history of farmer actions, reported barriers, and verified savings.

### 2. Agricultural Expert Portal (`/expert`)
- Dedicated KVK Agronomist review desk for **Dr. K. Patel**.
- Escalated cases queue, AI reasoning inspection, telemetry citations, and one-click **Approve**, **Correct Advisory**, or **Request Field Visit**.

### 3. Government & Extension Dashboard (`/dashboard`)
- Dedicated portal for District Agriculture Officers (**DAO Ramesh Kumar**).
- **Primary KPI: Actionable Advisory Rate (74%)**.
- Recharts visualizations for **Adoption Funnel** and **Barrier Distribution**.
- Interactive **GIS Agricultural Risk Map** (Leaflet) with weather alert contours.

### 4. Knowledge & Dataset Center (`/admin`)
- RAG document processing pipeline (PDF, DOCX, CSV) with Qdrant vector indexing.
- Dataset import wizard with flexible column mapping and validation.
- Reset Demo Data control.

---

## 🚀 4. Tech Stack

- **Framework**: Next.js 14 (App Router), Strict TypeScript
- **Styling**: Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Database & ORM**: PostgreSQL (Neon-ready) + PostGIS + Drizzle ORM
- **Fallback Store**: High-reliability in-memory / JSON-backed store for deterministic offline demo mode
- **Vector Search (RAG)**: Qdrant vector client + in-memory cosine similarity fallback
- **Caching**: Upstash Redis + in-memory cache adapter
- **Perception**: Web Speech Recognition (STT), SpeechSynthesis (TTS), Gemini/Demo Vision
- **Charts & Maps**: Recharts, Leaflet / React-Leaflet GIS

---

## ⚙️ 5. Quick Start (Running Locally)

```bash
# 1. Install dependencies
pnpm install

# 2. Run local development server
pnpm run dev

# 3. Run unit test suite
pnpm test

# 4. Production build
pnpm run build
```

Open [http://localhost:3000](http://localhost:3000) for the Farmer portal.
Navigate directly to:
- Expert Review: [http://localhost:3000/expert](http://localhost:3000/expert)
- Extension Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Knowledge & Datasets: [http://localhost:3000/admin](http://localhost:3000/admin)
