export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ttsProvider } from "@/lib/providers/speech";

export async function POST(request: NextRequest) {
  try {
    const { text, language = "hi" } = await request.json();
    const result = await ttsProvider.synthesize(text, language);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "TTS_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
