export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/lib/services/knowledge.service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No file provided" } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const doc = await knowledgeService.processAndIndexDocument(
      buffer,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
