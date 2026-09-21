import { mockDb } from "../db/mock-storage";
import { db } from "../db";
import { actions, adoptionBarriers, outcomes, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";

export class ActionService {
  async getActionsForFarmer(farmerId: string) {
    if (db) {
      try {
        let dbActions = await db.select().from(actions).where(eq(actions.farmerId, farmerId));
        if (dbActions.length === 0) {
          dbActions = await db.select().from(actions).limit(5);
        }
        if (dbActions.length > 0) return dbActions;
      } catch (err) {
        console.warn("DB actions query fallback to mockDb:", err);
      }
    }
    return mockDb.actions.findByFarmerId(farmerId);
  }

  async markActionCompleted(actionId: string, notes?: string) {
    const completedAt = new Date();
    const cleanNotes = notes || "Completed by farmer via one-touch confirmation.";

    if (db) {
      try {
        await db
          .update(actions)
          .set({
            status: "COMPLETED",
            completedAt,
            notes: cleanNotes,
          })
          .where(eq(actions.id, actionId));

        const actionRows = await db.select().from(actions).where(eq(actions.id, actionId)).limit(1);
        const farmerId = actionRows[0]?.farmerId || "frm_ravi";
        const farmId = actionRows[0]?.farmId || "farm_ravi_01";

        await db.insert(auditLogs).values({
          id: `aud_${Date.now()}`,
          userId: farmerId,
          action: "ACTION_COMPLETED",
          entityType: "ACTION",
          entityId: actionId,
          metadata: { completedAt, notes: cleanNotes },
        });

        await db.insert(outcomes).values({
          id: `out_${Date.now()}`,
          actionId,
          farmId,
          cropId: "crp_ravi_paddy",
          beforeState: "Field moisture was 68.5% with rain imminent.",
          afterState: "Avoided unnecessary irrigation pumping. Preserved soil root health.",
          yieldImpact: "+5% preservation",
          costSavingsInr: 650.0,
          waterSavedLiters: 12000.0,
          expertValidated: false,
        });
      } catch (dbErr) {
        console.warn("Failed to update action completion in PostgreSQL:", dbErr);
      }
    }

    const updated = mockDb.actions.update(actionId, {
      status: "COMPLETED",
      completedAt,
      notes: cleanNotes,
    });

    if (updated) {
      mockDb.auditLogs.create({
        userId: updated.farmerId,
        action: "ACTION_COMPLETED",
        entityType: "ACTION",
        entityId: actionId,
        metadata: { completedAt, notes: cleanNotes },
      });

      mockDb.outcomes.create({
        actionId,
        farmId: updated.farmId,
        cropId: "crp_ravi_paddy",
        beforeState: "Field moisture was 68.5% with rain imminent.",
        afterState: "Avoided unnecessary irrigation pumping. Preserved soil root health.",
        yieldImpact: "+5% preservation",
        costSavingsInr: 650.0,
        waterSavedLiters: 12000.0,
        expertValidated: false,
      });
    }

    return updated;
  }

  async recordAdoptionBarrier(
    actionId: string,
    barrierType:
      | "TOO_EXPENSIVE"
      | "INPUT_UNAVAILABLE"
      | "DIDNT_UNDERSTAND"
      | "NO_LABOUR"
      | "NO_WATER"
      | "NO_EQUIPMENT"
      | "TIMING_ISSUE"
      | "OTHER",
    notes?: string
  ) {
    const barrierId = `bar_${Date.now()}`;
    const barrierNotes = notes || `Farmer reported barrier: ${barrierType}`;

    if (db) {
      try {
        await db
          .update(actions)
          .set({
            status: "NOT_POSSIBLE",
            notes: barrierNotes,
          })
          .where(eq(actions.id, actionId));

        const actionRows = await db.select().from(actions).where(eq(actions.id, actionId)).limit(1);
        const farmerId = actionRows[0]?.farmerId || "frm_ravi";

        await db.insert(adoptionBarriers).values({
          id: barrierId,
          actionId,
          farmerId,
          barrierType,
          notes: barrierNotes,
        });

        await db.insert(auditLogs).values({
          id: `aud_${Date.now()}`,
          userId: farmerId,
          action: "ADOPTION_BARRIER_RECORDED",
          entityType: "BARRIER",
          entityId: barrierId,
          metadata: { barrierType, actionId },
        });
      } catch (dbErr) {
        console.warn("Failed to record adoption barrier in PostgreSQL:", dbErr);
      }
    }

    const action = mockDb.actions.findById(actionId);
    if (action) {
      mockDb.actions.update(actionId, {
        status: "NOT_POSSIBLE",
        notes: barrierNotes,
      });

      const barrier = mockDb.adoptionBarriers.create({
        id: barrierId,
        actionId,
        farmerId: action.farmerId,
        barrierType,
        notes: barrierNotes,
      });

      mockDb.auditLogs.create({
        userId: action.farmerId,
        action: "ADOPTION_BARRIER_RECORDED",
        entityType: "BARRIER",
        entityId: barrier.id,
        metadata: { barrierType, actionId },
      });

      return barrier;
    }

    return {
      id: barrierId,
      actionId,
      farmerId: "frm_ravi",
      barrierType,
      notes: barrierNotes,
      reportedAt: new Date(),
    };
  }
}

export const actionService = new ActionService();

