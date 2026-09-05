import { mockDb } from "../db/mock-storage";

export class ActionService {
  async getActionsForFarmer(farmerId: string) {
    return mockDb.actions.findByFarmerId(farmerId);
  }

  async markActionCompleted(actionId: string, notes?: string) {
    const updated = mockDb.actions.update(actionId, {
      status: "COMPLETED",
      completedAt: new Date(),
      notes: notes || "Completed by farmer via one-touch confirmation.",
    });

    if (updated) {
      mockDb.auditLogs.create({
        userId: updated.farmerId,
        action: "ACTION_COMPLETED",
        entityType: "ACTION",
        entityId: actionId,
        metadata: { completedAt: new Date(), notes },
      });

      // Auto-create initial outcome entry
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
    const action = mockDb.actions.findById(actionId);
    if (!action) throw new Error("Action not found");

    // Update action status to NOT_POSSIBLE
    mockDb.actions.update(actionId, {
      status: "NOT_POSSIBLE",
      notes: notes || `Farmer reported barrier: ${barrierType}`,
    });

    // Record adoption barrier
    const barrier = mockDb.adoptionBarriers.create({
      actionId,
      farmerId: action.farmerId,
      barrierType,
      notes,
    });

    // Log for explainability
    mockDb.auditLogs.create({
      userId: action.farmerId,
      action: "ADOPTION_BARRIER_RECORDED",
      entityType: "BARRIER",
      entityId: barrier.id,
      metadata: { barrierType, actionId },
    });

    return barrier;
  }
}

export const actionService = new ActionService();
