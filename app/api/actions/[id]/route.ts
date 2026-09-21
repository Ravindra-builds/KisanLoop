export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { actionService } from "@/lib/services/action.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (body.status === "COMPLETED") {
      const updated = await actionService.markActionCompleted(params.id, body.notes);
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.status === "NOT_POSSIBLE" && body.barrierType) {
      const barrier = await actionService.recordAdoptionBarrier(
        params.id,
        body.barrierType,
        body.notes
      );
      return NextResponse.json({ success: true, data: { actionId: params.id, barrier } });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_STATUS", message: "Invalid action status payload" } },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ACTION_UPDATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
