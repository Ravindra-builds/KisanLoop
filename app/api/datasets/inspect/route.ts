import { NextRequest, NextResponse } from "next/server";
import { datasetService } from "@/lib/services/dataset.service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No dataset file uploaded" } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const preview = await datasetService.inspectFile(buffer, file.name);

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INSPECT_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
