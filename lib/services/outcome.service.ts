import { mockDb } from "../db/mock-storage";

export class OutcomeService {
  async getOutcomesForFarm(farmId: string) {
    return mockDb.outcomes.findByFarmId(farmId);
  }

  async recordOutcome(data: {
    actionId: string;
    farmId: string;
    cropId?: string;
    beforeState?: string;
    afterState?: string;
    yieldImpact?: string;
    costSavingsInr?: number;
    waterSavedLiters?: number;
    expertValidated?: boolean;
    expertValidationNotes?: string;
  }) {
    return mockDb.outcomes.create(data);
  }
}

export const outcomeService = new OutcomeService();
