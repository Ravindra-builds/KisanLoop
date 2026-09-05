import { mockDb } from "../db/mock-storage";
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
    const recs = mockDb.recommendations.findByFarmId(farmId);
    return recs.map((r) => {
      const evidence = mockDb.recommendationEvidence.findByRecommendationId(r.id);
      return { ...r, evidence };
    });
  }

  async getRecommendationPassport(id: string) {
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
    // Check feasibility
    const farm = mockDb.farms.findById(input.farmId);
    const feasibility = await feasibilityEngine.evaluate({
      farmerId: farm ? farm.farmerId : "unknown",
      farmId: input.farmId,
      actionTitle: input.title,
      estimatedCostInr: input.estimatedCostInr,
      requiresCommercialChemicals: input.requiresCommercialChemicals,
    });

    const rec = mockDb.recommendations.create({
      farmId: input.farmId,
      cropId: input.cropId || null,
      riskEventId: input.riskEventId || null,
      title: input.title,
      reason: input.reason,
      actionSummary: input.actionSummary,
      deadline: input.deadline || new Date(Date.now() + 86400000),
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

    // Automatically create corresponding initial Action for the farmer
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
