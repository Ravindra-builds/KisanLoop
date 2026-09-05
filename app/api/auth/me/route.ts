import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, TEST_USERS, AuthUser } from "@/lib/auth/constants";

export async function GET(req: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE !== "false";

  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      return NextResponse.json({
        success: true,
        data: {
          user: decoded as AuthUser,
          isDemoMode,
        },
      });
    } catch {
      // Fallback
    }
  }

  // If in demo mode and no cookie, return hero farmer Ravi Kumar as default
  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      data: {
        user: TEST_USERS[0],
        isDemoMode,
      },
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Not logged in" },
      data: { isDemoMode },
    },
    { status: 401 }
  );
}
