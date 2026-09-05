import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-storage";

export async function POST() {
  try {
    mockDb.reset();
    return NextResponse.json({
      success: true,
      message: "Demo database reset to initial seeded state (Hero Farmer Ravi Kumar).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "RESET_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
