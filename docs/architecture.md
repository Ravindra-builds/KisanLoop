# KisanLoop System Architecture

```
                                KISANLOOP
                                    │
                   ┌────────────────┼────────────────┐
                   ↓                ↓                ↓
                FARMER            EXPERT         GOVERNMENT
              (Mobile)          (Review)         (Analytics)
                   │                │                │
                   └────────────────┼────────────────┘
                                    ↓
                                 NEXT.JS (App Router + TS)
                                    │
                   ┌────────────────┼─────────────────┐
                   ↓                ↓                 ↓
              REST APIs          AI SDK            INNGEST
              (Routes)       (Gemini/OpenAI)     (Background)
                   │                │                 │
                   ↓                ↓                 ↓
               Services         STT / TTS      Document / Vision
                   │          Vision / RAG        Pipelines
                   ↓
                DRIZZLE ORM
                   │
         ┌─────────┴─────────┐
         ↓                   ↓
   NEON POSTGRES          QDRANT
   (+ PostGIS)         (Vector Search)

   Upstash Redis  → Caching & Rate Limiting
   Cloudflare R2  → Media, Datasets & Documents
```

---

## 1. Core Principles
1. **Action-First Design**: The product does not optimize for LLM chat length or technical dumps. It optimizes for feasible, verified agricultural actions.
2. **Adapter-First Architecture**: No vendor code leaks into core business logic. All external systems (Weather, Soil, Satellite, Vision, Speech, Storage, Vector Search) implement normalized interfaces with deterministic demo adapters.
3. **Traceability (Passport)**: Every recommendation links to underlying sensor telemetry, weather models, research citations, farmer actions, and outcomes.
4. **Feasibility Validation**: The Feasibility Engine screens every recommendation against smallholder constraints before presentation.
5. **AI Safety Escalation**: Vision diagnoses with <85% confidence or high-risk chemical advice automatically escalate to agricultural experts.
