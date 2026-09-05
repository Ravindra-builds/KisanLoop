import { NextRequest, NextResponse } from "next/server";
import { expertService } from "@/lib/services/expert.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, notes, correctionDetails, expertId } = body;

    const result = await expertService.reviewCase(params.id, action, {
      notes,
      correctionDetails,
      expertId,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "REVIEW_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
