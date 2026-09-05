import { mockDb } from "../db/mock-storage";

export class ExpertService {
  async getCasesQueue() {
    const reviews = mockDb.expertReviews.findMany();
    return reviews.map((rev) => {
      const rec = mockDb.recommendations.findById(rev.recommendationId);
      const farm = rec ? mockDb.farms.findById(rec.farmId) : null;
      const farmer = farm ? mockDb.farmers.findById(farm.farmerId) : null;
      const evidence = rec ? mockDb.recommendationEvidence.findByRecommendationId(rec.id) : [];

      return {
        id: rev.id,
        status: rev.status,
        expertNotes: rev.expertNotes,
        correctionDetails: rev.correctionDetails,
        reviewedAt: rev.reviewedAt,
        createdAt: rev.createdAt,
        recommendation: rec,
        farmer,
        farm,
        evidence,
      };
    });
  }

  async reviewCase(
    caseId: string,
    action: "APPROVE" | "CORRECT" | "REQUEST_FOLLOW_UP",
    details: {
      notes?: string;
      correctionDetails?: string;
      expertId?: string;
    }
  ) {
    const statusMap = {
      APPROVE: "APPROVED",
      CORRECT: "CORRECTED",
      REQUEST_FOLLOW_UP: "FOLLOW_UP_REQUESTED",
    } as const;

    const updated = mockDb.expertReviews.update(caseId, {
      status: statusMap[action],
      expertNotes: details.notes || null,
      correctionDetails: details.correctionDetails || null,
      expertId: details.expertId || "usr_expert_patel",
    });

    if (updated) {
      mockDb.auditLogs.create({
        userId: details.expertId || "usr_expert_patel",
        action: `EXPERT_${statusMap[action]}`,
        entityType: "EXPERT_REVIEW",
        entityId: caseId,
        metadata: { notes: details.notes, correctionDetails: details.correctionDetails },
      });
    }

    return updated;
  }
}

export const expertService = new ExpertService();
