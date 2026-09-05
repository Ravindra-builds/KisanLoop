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

export const vectorProvider: VectorProvider = new MemoryVectorAdapter();
