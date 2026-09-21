import { mockDb } from "../db/mock-storage";
import { db } from "../db";
import {
  recommendations,
  recommendationEvidence,
  actions,
  outcomes,
  adoptionBarriers,
  expertReviews,
  farms,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { farmStateService } from "./farm-state.service";
import { feasibilityEngine } from "./feasibility.service";

export interface CreateRecommendationInput {
  farmId: string;
  cropId?: string;
  riskEventId?: string;
  title: string;
  reason: string;
  actionSummary: string;
  deadline?: Date;
  confidenceScore?: number;
  riskLevel?: "low" | "moderate" | "high";
  requiresExpertReview?: boolean;
  estimatedCostInr?: number;
  requiresCommercialChemicals?: boolean;
  evidence?: {
    type: "WEATHER" | "SOIL" | "SATELLITE" | "VISION" | "KNOWLEDGE_DOC";
    title: string;
    details: string;
    sourceDocumentId?: string;
  }[];
}

export class RecommendationService {
  async getRecommendationsForFarm(farmId: string) {
    const activeDb = db;
    if (activeDb) {
      try {
        let dbRecs = await activeDb.select().from(recommendations).where(eq(recommendations.farmId, farmId));
        if (dbRecs.length === 0) {
          // If query with custom farmId returned 0, try default farm or all recs
          dbRecs = await activeDb.select().from(recommendations).limit(5);
        }

        if (dbRecs.length > 0) {
          const recsWithEvidence = await Promise.all(
            dbRecs.map(async (r) => {
              const ev = await activeDb
                .select()
                .from(recommendationEvidence)
                .where(eq(recommendationEvidence.recommendationId, r.id));
              return { ...r, evidence: ev };
            })
          );
          return recsWithEvidence;
        }
      } catch (err) {
        console.warn("DB recommendations query fallback to mockDb:", err);
      }
    }

    const recs = mockDb.recommendations.findByFarmId(farmId);
    return recs.map((r) => {
      const evidence = mockDb.recommendationEvidence.findByRecommendationId(r.id);
      return { ...r, evidence };
    });
  }

  async getRecommendationPassport(id: string) {
    if (db) {
      try {
        const found = await db.select().from(recommendations).where(eq(recommendations.id, id)).limit(1);
        if (found.length > 0) {
          const rec = found[0];
          const evidence = await db
            .select()
            .from(recommendationEvidence)
            .where(eq(recommendationEvidence.recommendationId, rec.id));

          const actionRows = await db
            .select()
            .from(actions)
            .where(eq(actions.recommendationId, rec.id))
            .limit(1);
          const relatedAction = actionRows[0] || null;

          let relatedOutcome = null;
          let relatedBarrier = null;
          if (relatedAction) {
            const outRows = await db.select().from(outcomes).where(eq(outcomes.actionId, relatedAction.id)).limit(1);
            relatedOutcome = outRows[0] || null;

            const barRows = await db
              .select()
              .from(adoptionBarriers)
              .where(eq(adoptionBarriers.actionId, relatedAction.id))
              .limit(1);
            relatedBarrier = barRows[0] || null;
          }

          const revRows = await db
            .select()
            .from(expertReviews)
            .where(eq(expertReviews.recommendationId, rec.id))
            .limit(1);
          const expertReview = revRows[0] || null;

          return {
            recommendation: rec,
            evidence,
            action: relatedAction,
            outcome: relatedOutcome,
            barrier: relatedBarrier,
            expertReview,
          };
        }
      } catch (err) {
        console.warn("DB recommendation passport fallback to mockDb:", err);
      }
    }

    const rec = mockDb.recommendations.findById(id);
    if (!rec) return null;

    const evidence = mockDb.recommendationEvidence.findByRecommendationId(rec.id);
    const relatedAction = mockDb.actions
      .findMany()
      .find((a) => a.recommendationId === rec.id);

    const relatedOutcome = relatedAction
      ? mockDb.outcomes.findMany().find((o) => o.actionId === relatedAction.id)
      : null;

    const relatedBarrier = relatedAction
      ? mockDb.adoptionBarriers.findMany().find((b) => b.actionId === relatedAction.id)
      : null;

    const expertReview = mockDb.expertReviews
      .findMany()
      .find((er) => er.recommendationId === rec.id);

    return {
      recommendation: rec,
      evidence,
      action: relatedAction,
      outcome: relatedOutcome,
      barrier: relatedBarrier,
      expertReview,
    };
  }

  async createRecommendation(input: CreateRecommendationInput) {
    const farm = mockDb.farms.findById(input.farmId);
    const feasibility = await feasibilityEngine.evaluate({
      farmerId: farm ? farm.farmerId : "unknown",
      farmId: input.farmId,
      actionTitle: input.title,
      estimatedCostInr: input.estimatedCostInr,
      requiresCommercialChemicals: input.requiresCommercialChemicals,
    });

    const recId = `rec_${Date.now()}`;
    const deadline = input.deadline || new Date(Date.now() + 86400000);

    if (db) {
      try {
        await db.insert(recommendations).values({
          id: recId,
          farmId: input.farmId,
          cropId: input.cropId || null,
          riskEventId: input.riskEventId || null,
          title: input.title,
          reason: input.reason,
          actionSummary: input.actionSummary,
          deadline,
          confidenceScore: input.confidenceScore ?? 0.9,
          riskLevel: input.riskLevel || "low",
          requiresExpertReview: input.requiresExpertReview ?? !feasibility.isFeasible,
          isFeasible: feasibility.isFeasible,
          alternativeAction: feasibility.suggestedAlternative || null,
          status: "ACTIVE",
        });

        if (input.evidence && input.evidence.length > 0) {
          for (let i = 0; i < input.evidence.length; i++) {
            const ev = input.evidence[i];
            await db.insert(recommendationEvidence).values({
              id: `ev_${Date.now()}_${i}`,
              recommendationId: recId,
              evidenceType: ev.type,
              title: ev.title,
              details: ev.details,
              sourceDocumentId: ev.sourceDocumentId || null,
            });
          }
        }

        let farmerId = "frm_ravi";
        const dbFarm = await db.select().from(farms).where(eq(farms.id, input.farmId)).limit(1);
        if (dbFarm.length > 0) farmerId = dbFarm[0].farmerId;

        await db.insert(actions).values({
          id: `act_${Date.now()}`,
          recommendationId: recId,
          farmerId,
          farmId: input.farmId,
          title: input.actionSummary,
          description: input.reason,
          deadline,
          status: "PENDING",
        });
      } catch (dbErr) {
        console.warn("Failed to insert recommendation into PostgreSQL:", dbErr);
      }
    }

    const rec = mockDb.recommendations.create({
      id: recId,
      farmId: input.farmId,
      cropId: input.cropId || null,
      riskEventId: input.riskEventId || null,
      title: input.title,
      reason: input.reason,
      actionSummary: input.actionSummary,
      deadline,
      confidenceScore: input.confidenceScore ?? 0.9,
      riskLevel: input.riskLevel || "low",
      requiresExpertReview: input.requiresExpertReview ?? !feasibility.isFeasible,
      isFeasible: feasibility.isFeasible,
      alternativeAction: feasibility.suggestedAlternative || null,
      status: "ACTIVE",
    });

    if (input.evidence && input.evidence.length > 0) {
      for (const ev of input.evidence) {
        mockDb.recommendationEvidence.create({
          recommendationId: rec.id,
          evidenceType: ev.type,
          title: ev.title,
          details: ev.details,
          sourceDocumentId: ev.sourceDocumentId || null,
        });
      }
    }

    if (farm) {
      mockDb.actions.create({
        recommendationId: rec.id,
        farmerId: farm.farmerId,
        farmId: farm.id,
        title: input.actionSummary,
        description: input.reason,
        deadline: rec.deadline,
        status: "PENDING",
      });
    }

    return rec;
  }
}

export const recommendationService = new RecommendationService();

