import { NextRequest, NextResponse } from "next/server";
import { farmStateService } from "@/lib/services/farm-state.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId") || "farm_ravi_01";

    const state = await farmStateService.getFarmState(farmId);
    return NextResponse.json({ success: true, data: state });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FARM_STATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
