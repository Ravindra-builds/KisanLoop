import { inngest } from "./client";
import { visionProvider } from "../lib/providers/vision";
import { recommendationService } from "../lib/services/recommendation.service";
import { mockDb } from "../lib/db/mock-storage";

// 1. Background Crop Image Analysis Workflow
export const analyzeCropImageWorkflow = inngest.createFunction(
  { id: "crop-image-analysis-workflow" },
  { event: "crop/image.uploaded" },
  async ({ event, step }) => {
    const { farmId, imageUrl, cropName } = event.data;

    // Step 1: Vision Perception
    const diagnosis = await step.run("vision-diagnosis", async () => {
      return visionProvider.analyzeCropImage(imageUrl, cropName);
    });

    // Step 2: Formulate Recommendation if disease detected
    const recommendation = await step.run("formulate-recommendation", async () => {
      return recommendationService.createRecommendation({
        farmId,
        title: `Manage ${diagnosis.pestOrDiseaseName}`,
        reason: diagnosis.symptoms.join(". "),
        actionSummary: diagnosis.recommendedImmediateAction,
        confidenceScore: diagnosis.confidence,
        riskLevel: diagnosis.severity === "HIGH" ? "high" : "moderate",
        requiresExpertReview: diagnosis.requiresExpertReview,
        requiresCommercialChemicals: false,
        evidence: [
          {
            type: "VISION",
            title: "Vision Model Inspection",
            details: `Detected with ${(diagnosis.confidence * 100).toFixed(0)}% confidence: ${diagnosis.pestOrDiseaseName}`,
          },
        ],
      });
    });

    // Step 3: Escalate to expert review if needed
    if (diagnosis.requiresExpertReview) {
      await step.run("expert-escalation", async () => {
        mockDb.expertReviews.create({
          recommendationId: recommendation.id,
          status: "PENDING",
          expertNotes: "Flagged automatically by AI safety policy: Vision confidence < 85%.",
        });
      });
    }

    return { status: "COMPLETED", recommendationId: recommendation.id };
  }
);

// 2. Background Outcome Validation Workflow
export const outcomeFollowupWorkflow = inngest.createFunction(
  { id: "outcome-followup-workflow" },
  { event: "action/completed" },
  async ({ event, step }) => {
    const { actionId } = event.data;

    await step.sleep("wait-for-crop-response", "24h");

    await step.run("compute-outcome-delta", async () => {
      console.log(`Evaluating post-intervention outcome for action ${actionId}`);
    });

    return { status: "OUTCOME_RECORDED" };
  }
);

export const functions = [analyzeCropImageWorkflow, outcomeFollowupWorkflow];
