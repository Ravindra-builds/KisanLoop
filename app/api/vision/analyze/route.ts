export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { visionProvider } from "@/lib/providers/vision";
import { recommendationService } from "@/lib/services/recommendation.service";
import { mockDb } from "@/lib/db/mock-storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, farmId = "farm_ravi_01", cropName = "Paddy" } = body;

    // 1. Analyze image via vision adapter
    const diagnosis = await visionProvider.analyzeCropImage(imageBase64 || "", cropName);

    // 2. Persist diagnosis observation
    mockDb.pestObservations.create({
      farmId,
      cropId: "crp_ravi_paddy",
      pestOrDiseaseName: diagnosis.pestOrDiseaseName,
      confidenceScore: diagnosis.confidence,
      symptoms: diagnosis.symptoms.join(". "),
      severity: diagnosis.severity,
      imageUrl: "/demo/paddy_leaf_blast.jpg",
    });

    // 3. Create Actionable Recommendation & Check Feasibility
    const rec = await recommendationService.createRecommendation({
      farmId,
      title: `Treat ${diagnosis.pestOrDiseaseName}`,
      reason: diagnosis.symptoms.join(". "),
      actionSummary: diagnosis.recommendedImmediateAction,
      confidenceScore: diagnosis.confidence,
      riskLevel: diagnosis.severity === "HIGH" ? "high" : "moderate",
      requiresExpertReview: diagnosis.requiresExpertReview,
      requiresCommercialChemicals: false,
      evidence: [
        {
          type: "VISION",
          title: "Computer Vision Diagnosis",
          details: `Symptoms matched: ${diagnosis.symptoms.join("; ")} with ${(diagnosis.confidence * 100).toFixed(0)}% confidence.`,
        },
        {
          type: "KNOWLEDGE_DOC",
          title: "Jharkhand State IPM & Pest Advisory Manual",
          details: "Early treatment using biological agents prevents spore transfer to heading panicles.",
        },
      ],
    });

    // 4. Create Expert Review case if confidence is low or required
    if (diagnosis.requiresExpertReview) {
      mockDb.expertReviews.create({
        recommendationId: rec.id,
        status: "PENDING",
        expertNotes: "Auto-escalated: Vision confidence is below 85% safety threshold.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        recommendation: rec,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VISION_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
