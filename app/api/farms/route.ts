import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-storage";

export async function GET() {
  try {
    const farms = mockDb.farms.findMany();
    return NextResponse.json({ success: true, data: farms });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
