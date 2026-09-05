import { NextResponse } from "next/server";
import { knowledgeService } from "@/lib/services/knowledge.service";

export async function GET() {
  try {
    const docs = await knowledgeService.listDocuments();
    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
