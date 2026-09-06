import crypto from "crypto";
import { VectorProvider, VectorSearchResult } from "./types";

function ensureUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  const hash = crypto.createHash("md5").update(id).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

export async function generateTextEmbedding(text: string, dimensions: number = 128): Promise<number[]> {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (googleKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: text.slice(0, 2000) }] },
            outputDimensionality: dimensions,
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.embedding?.values) {
          return json.embedding.values;
        }
      }
    } catch {
      // Fallback
    }
  }

  // Deterministic 128-d feature hashing
  const vec = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

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

  private async ensureCollection(collection: string, vectorSize: number = 128) {
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
      const sanitizedPoints = points.map((p) => ({
        ...p,
        id: ensureUuid(p.id),
      }));

      if (sanitizedPoints.length > 0 && sanitizedPoints[0].vector?.length) {
        await this.ensureCollection(collection, sanitizedPoints[0].vector.length);
      }

      const res = await fetch(`${this.url}/collections/${collection}/points`, {
        method: "PUT",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points: sanitizedPoints }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Qdrant upsert returned ${res.status}: ${errText}`);
      }
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

