import { NextRequest, NextResponse } from "next/server";
import { datasetService } from "@/lib/services/dataset.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, filename, rowCount, mapping } = body;

    const imported = await datasetService.importDataset(name, filename, rowCount, mapping);

    return NextResponse.json({
      success: true,
      data: imported,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "IMPORT_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
