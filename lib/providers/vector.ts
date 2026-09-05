import { VectorProvider, VectorSearchResult } from "./types";

// Memory vector store with cosine similarity calculation
export class MemoryVectorAdapter implements VectorProvider {
  private collections: Map<
    string,
    { id: string; vector: number[]; payload: Record<string, any> }[]
  > = new Map();

  async upsertVectors(
    collection: string,
    points: { id: string; vector: number[]; payload: Record<string, any> }[]
  ): Promise<void> {
    const existing = this.collections.get(collection) || [];
    const pointMap = new Map(existing.map((p) => [p.id, p]));
    for (const p of points) {
      pointMap.set(p.id, p);
    }
    this.collections.set(collection, Array.from(pointMap.values()));
  }

  async searchVectors(
    collection: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    const points = this.collections.get(collection) || [];
    if (points.length === 0) {
      // Seeded default knowledge chunks for Demo mode RAG
      return [
        {
          id: "chunk_01",
          documentId: "kdoc_icar_paddy_2024",
          score: 0.92,
          text: "ICAR Kharif Rice Guidelines: When rainfall probability exceeds 75% and forecasted precipitation is over 30mm, farmers should suspend supplemental irrigation to avoid root aeration deficit and nutrient runoff.",
          metadata: { crop: "Paddy", topic: "Irrigation Management" },
        },
        {
          id: "chunk_02",
          documentId: "kdoc_pest_mgmt_jh",
          score: 0.86,
          text: "Jharkhand IPM Manual: Early vegetative blast lesions should be contained using bio-control agents like Pseudomonas fluorescens (2.5 kg/ha) or NSKE 5% spray. Chemical fungicides like Tricyclazole 75 WP are restricted to severe outbreaks.",
          metadata: { crop: "Paddy", topic: "Disease Control" },
        },
      ];
    }

    // Cosine similarity
    const scored = points.map((p) => {
      const dot = p.vector.reduce((sum, val, idx) => sum + val * (queryVector[idx] || 0), 0);
      const magA = Math.sqrt(p.vector.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));
      const sim = magA && magB ? dot / (magA * magB) : 0;
      return {
        id: p.id,
        documentId: p.payload.documentId || "",
        score: sim,
        text: p.payload.text || "",
        metadata: p.payload,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export class QdrantCloudAdapter implements VectorProvider {
  private url: string;
  private apiKey: string;
  private fallback: MemoryVectorAdapter;

  constructor(url: string, apiKey: string) {
    this.url = url.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.fallback = new MemoryVectorAdapter();
  }

  private async ensureCollection(collection: string, vectorSize: number = 768) {
    try {
      await fetch(`${this.url}/collections/${collection}`, {
        method: "PUT",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine",
          },
        }),
      });
    } catch {
      // Collection might already exist
    }
  }

  async upsertVectors(
    collection: string,
    points: { id: string; vector: number[]; payload: Record<string, any> }[]
  ): Promise<void> {
    try {
      if (points.length > 0 && points[0].vector?.length) {
        await this.ensureCollection(collection, points[0].vector.length);
      }
      const res = await fetch(`${this.url}/collections/${collection}/points`, {
        method: "PUT",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) throw new Error(`Qdrant upsert returned ${res.status}`);
    } catch (err) {
      console.warn("Qdrant upsert failed, using memory vector fallback:", err);
      await this.fallback.upsertVectors(collection, points);
    }
  }

  async searchVectors(
    collection: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    try {
      const res = await fetch(`${this.url}/collections/${collection}/points/search`, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vector: queryVector,
          limit,
          with_payload: true,
        }),
      });
      if (!res.ok) throw new Error(`Qdrant search returned ${res.status}`);
      const json = await res.json();
      const hits = json.result || [];
      if (hits.length === 0) {
        return this.fallback.searchVectors(collection, queryVector, limit);
      }
      return hits.map((h: any) => ({
        id: String(h.id),
        documentId: h.payload?.documentId || "",
        score: h.score,
        text: h.payload?.text || "",
        metadata: h.payload || {},
      }));
    } catch (err) {
      console.warn("Qdrant search failed, falling back to memory vector store:", err);
      return this.fallback.searchVectors(collection, queryVector, limit);
    }
  }
}

const isExplicitDemo = process.env.DEMO_MODE === "true";
const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

export const vectorProvider: VectorProvider =
  !isExplicitDemo && qdrantUrl && qdrantApiKey
    ? new QdrantCloudAdapter(qdrantUrl, qdrantApiKey)
    : new MemoryVectorAdapter();
