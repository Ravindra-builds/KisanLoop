import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "../lib/db/mock-storage";
import { farmStateService } from "../lib/services/farm-state.service";
import { feasibilityEngine } from "../lib/services/feasibility.service";
import { recommendationService } from "../lib/services/recommendation.service";
import { actionService } from "../lib/services/action.service";
import { datasetService } from "../lib/services/dataset.service";

describe("KisanLoop Core Business Logic & Engines", () => {
  beforeEach(() => {
    mockDb.reset();
  });

  it("FarmStateEngine computes normalized farm state for Hero Farmer Ravi Kumar", async () => {
    const state = await farmStateService.getFarmState("farm_ravi_01");

    expect(state).toBeDefined();
    expect(state.farmId).toBe("farm_ravi_01");
    expect(state.cropName).toBe("Paddy (IR-64)");
    expect(state.cropStage).toBe("Vegetative");
    expect(state.rainRisk).toBe("high"); // Rain forecast tomorrow
    expect(state.soilMoisture).toBe("adequate"); // 68.5%
    expect(state.summary).toContain("Do not irrigate");
  });

  it("FeasibilityEngine detects input availability constraints and recommends alternatives", async () => {
    const feasibleCheck = await feasibilityEngine.evaluate({
      farmerId: "frm_ravi",
      farmId: "farm_ravi_01",
      actionTitle: "Spray bio-fungicide or neem extract",
      estimatedCostInr: 800,
      requiresCommercialChemicals: false,
    });

    expect(feasibleCheck.isFeasible).toBe(true);
    expect(feasibleCheck.score).toBe(1.0);

    const unfeasibleCheck = await feasibilityEngine.evaluate({
      farmerId: "frm_ravi",
      farmId: "farm_ravi_01",
      actionTitle: "Apply imported chemical fungicide formulation",
      estimatedCostInr: 3500, // Exceeds smallholder budget
      requiresCommercialChemicals: true,
    });

    expect(unfeasibleCheck.isFeasible).toBe(false);
    expect(unfeasibleCheck.barriersIdentified).toContain("HIGH_INPUT_COST");
    expect(unfeasibleCheck.suggestedAlternative).toBeDefined();
    expect(unfeasibleCheck.suggestedAlternative).toContain("NSKE 5%");
  });

  it("RecommendationService creates recommendation and links evidence in passport", async () => {
    const rec = await recommendationService.createRecommendation({
      farmId: "farm_ravi_01",
      title: "Test Hold Irrigation",
      reason: "Heavy monsoon shower imminent.",
      actionSummary: "Keep pump switched off.",
      evidence: [
        {
          type: "WEATHER",
          title: "IMD Doppler Radar",
          details: "85% precipitation probability",
        },
      ],
    });

    expect(rec).toBeDefined();
    expect(rec.isFeasible).toBe(true);

    const passport = await recommendationService.getRecommendationPassport(rec.id);
    expect(passport).toBeDefined();
    expect(passport?.recommendation.title).toBe("Test Hold Irrigation");
    expect(passport?.evidence.length).toBe(1);
    expect(passport?.evidence[0].title).toBe("IMD Doppler Radar");
  });

  it("ActionService tracks completion and logs adoption barrier", async () => {
    const actions = await actionService.getActionsForFarmer("frm_ravi");
    const testAction = actions[0];
    expect(testAction).toBeDefined();

    // Mark completed
    const completed = await actionService.markActionCompleted(testAction.id, "Pump held off");
    expect(completed?.status).toBe("COMPLETED");

    // Report barrier on second action
    if (actions[1]) {
      const barrier = await actionService.recordAdoptionBarrier(
        actions[1].id,
        "INPUT_UNAVAILABLE",
        "Local agri store out of stock"
      );
      expect(barrier.barrierType).toBe("INPUT_UNAVAILABLE");

      const updatedAction = mockDb.actions.findById(actions[1].id);
      expect(updatedAction?.status).toBe("NOT_POSSIBLE");
    }
  });

  it("DatasetService validates user column mapping and detects coordinate issues", () => {
    const headers = ["FarmerName", "Lat", "Lon", "Crop", "Acreage"];
    const validMapping = {
      name: "FarmerName",
      latitude: "Lat",
      longitude: "Lon",
      crop_name: "Crop",
      area_acres: "Acreage",
    };

    const sampleRows = [
      { FarmerName: "Ravi Kumar", Lat: "23.3441", Lon: "85.3096", Crop: "Paddy", Acreage: "1.2" },
      { FarmerName: "Birsa Munda", Lat: "23.1256", Lon: "85.2812", Crop: "Paddy", Acreage: "0.8" },
    ];

    const validation = datasetService.validateMapping(headers, validMapping, sampleRows);
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);

    // Missing required field
    const invalidMapping = { name: "FarmerName" };
    const invalidValidation = datasetService.validateMapping(headers, invalidMapping as any, sampleRows);
    expect(invalidValidation.isValid).toBe(false);
    expect(invalidValidation.errors.length).toBeGreaterThan(0);
  });
});
