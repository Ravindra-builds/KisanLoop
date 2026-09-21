export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const barriers = await dashboardService.getBarrierBreakdown();
    return NextResponse.json({ success: true, data: barriers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
