import { mockDb } from "../db/mock-storage";
import { db } from "../db";
import {
  expertReviews,
  recommendations,
  farms,
  farmers,
  recommendationEvidence,
  auditLogs,
} from "../db/schema";
import { eq } from "drizzle-orm";

export class ExpertService {
  async getCasesQueue() {
    const activeDb = db;
    if (activeDb) {
      try {
        const dbReviews = await activeDb.select().from(expertReviews);
        if (dbReviews.length > 0) {
          const detailedCases = await Promise.all(
            dbReviews.map(async (rev) => {
              const recRows = await activeDb
                .select()
                .from(recommendations)
                .where(eq(recommendations.id, rev.recommendationId))
                .limit(1);
              const rec = recRows[0] || null;

              let farm = null;
              let farmer = null;
              let evidence: any[] = [];

              if (rec) {
                const farmRows = await activeDb
                  .select()
                  .from(farms)
                  .where(eq(farms.id, rec.farmId))
                  .limit(1);
                farm = farmRows[0] || null;

                if (farm) {
                  const farmerRows = await activeDb
                    .select()
                    .from(farmers)
                    .where(eq(farmers.id, farm.farmerId))
                    .limit(1);
                  farmer = farmerRows[0] || null;
                }

                evidence = await activeDb
                  .select()
                  .from(recommendationEvidence)
                  .where(eq(recommendationEvidence.recommendationId, rec.id));
              }

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
            })
          );
          return detailedCases;
        }
      } catch (err) {
        console.warn("DB expertReviews query fallback to mockDb:", err);
      }
    }

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

    const expertId = details.expertId || "usr_expert_patel";
    const reviewedAt = new Date();

    if (db) {
      try {
        await db
          .update(expertReviews)
          .set({
            status: statusMap[action],
            expertNotes: details.notes || null,
            correctionDetails: details.correctionDetails || null,
            expertId,
            reviewedAt,
          })
          .where(eq(expertReviews.id, caseId));

        await db.insert(auditLogs).values({
          id: `aud_${Date.now()}`,
          userId: expertId,
          action: `EXPERT_${statusMap[action]}`,
          entityType: "EXPERT_REVIEW",
          entityId: caseId,
          metadata: { notes: details.notes, correctionDetails: details.correctionDetails },
        });
      } catch (dbErr) {
        console.warn("Failed to update expert review in PostgreSQL:", dbErr);
      }
    }

    const updated = mockDb.expertReviews.update(caseId, {
      status: statusMap[action],
      expertNotes: details.notes || null,
      correctionDetails: details.correctionDetails || null,
      expertId,
      reviewedAt,
    });

    if (updated) {
      mockDb.auditLogs.create({
        userId: expertId,
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

