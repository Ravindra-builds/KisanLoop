export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { recommendationService } from "@/lib/services/recommendation.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId") || "farm_ravi_01";

    const recs = await recommendationService.getRecommendationsForFarm(farmId);
    return NextResponse.json({ success: true, data: recs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "REC_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rec = await recommendationService.createRecommendation(body);
    return NextResponse.json({ success: true, data: rec });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_REC_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
