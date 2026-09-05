import { NextResponse } from "next/server";
import { expertService } from "@/lib/services/expert.service";

export async function GET() {
  try {
    const cases = await expertService.getCasesQueue();
    return NextResponse.json({ success: true, data: cases });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
