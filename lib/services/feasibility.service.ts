export interface FeasibilityCheckInput {
  farmerId: string;
  farmId: string;
  actionTitle: string;
  estimatedCostInr?: number;
  requiresSpecializedEquipment?: boolean;
  requiresCommercialChemicals?: boolean;
  requiresImmediateLabour?: boolean;
}

export interface FeasibilityResult {
  isFeasible: boolean;
  score: number; // 0.0 - 1.0
  barriersIdentified: string[];
  suggestedAlternative?: string;
  recommendationNote: string;
}

export class FeasibilityEngine {
  async evaluate(input: FeasibilityCheckInput): Promise<FeasibilityResult> {
    const barriers: string[] = [];

    // Check cost threshold for smallholder farmer (<2 acres)
    if (input.estimatedCostInr && input.estimatedCostInr > 2000) {
      barriers.push("HIGH_INPUT_COST");
    }

    // Check chemical availability
    if (input.requiresCommercialChemicals) {
      // Local village shops often face stock-outs for specialized fungicides
      barriers.push("POTENTIAL_STOCKOUT_RISK");
    }

    const isFeasible = barriers.length === 0;

    let suggestedAlternative: string | undefined;
    if (!isFeasible) {
      if (input.actionTitle.toLowerCase().includes("fungicide") || input.actionTitle.toLowerCase().includes("spray")) {
        suggestedAlternative =
          "If commercial fungicide is unavailable or cost-prohibitive, apply locally prepared Neem Seed Kernel Extract (NSKE 5%) or Pseudomonas fluorescens culture from the nearest KVK.";
      } else if (input.actionTitle.toLowerCase().includes("irrigate")) {
        suggestedAlternative = "Utilize furrow moisture conservation and check drainage bunds.";
      }
    }

    return {
      isFeasible,
      score: isFeasible ? 1.0 : 0.65,
      barriersIdentified: barriers,
      suggestedAlternative,
      recommendationNote: isFeasible
        ? "Action aligns with farmer's local capacity, irrigation resources, and landholding size."
        : `Potential constraints detected: ${barriers.join(", ")}. Viable low-cost alternative provided.`,
    };
  }
}

export const feasibilityEngine = new FeasibilityEngine();
