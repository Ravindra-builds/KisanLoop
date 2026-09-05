import { NextRequest, NextResponse } from "next/server";
import { actionService } from "@/lib/services/action.service";
import { mockDb } from "@/lib/db/mock-storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmerId = searchParams.get("farmerId") || "frm_ravi";
    const actions = await actionService.getActionsForFarmer(farmerId);
    return NextResponse.json({ success: true, data: actions });
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
    const created = mockDb.actions.create(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ACTION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
