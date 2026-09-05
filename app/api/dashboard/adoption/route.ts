import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const funnel = await dashboardService.getAdoptionFunnel();
    return NextResponse.json({ success: true, data: funnel });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
