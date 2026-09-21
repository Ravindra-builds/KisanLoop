export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { outcomeService } from "@/lib/services/outcome.service";
import { mockDb } from "@/lib/db/mock-storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");
    const outcomes = farmId
      ? await outcomeService.getOutcomesForFarm(farmId)
      : mockDb.outcomes.findMany();
    return NextResponse.json({ success: true, data: outcomes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await outcomeService.recordOutcome(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "OUTCOME_CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
