export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { recommendationService } from "@/lib/services/recommendation.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passport = await recommendationService.getRecommendationPassport(params.id);
    if (!passport) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Recommendation not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: passport });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
