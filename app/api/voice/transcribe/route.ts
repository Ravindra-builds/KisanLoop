export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sttProvider } from "@/lib/providers/speech";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sttProvider.transcribe(body.audioBase64 || "");
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "STT_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
