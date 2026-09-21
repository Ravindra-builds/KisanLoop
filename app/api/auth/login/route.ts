export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { TEST_USERS, AUTH_COOKIE_NAME, getDefaultRedirectForRole } from "@/lib/auth/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role } = body;

    let matchedUser = TEST_USERS.find(
      (u) => u.email.toLowerCase() === (email || "").toLowerCase()
    );

    if (!matchedUser && role) {
      matchedUser = TEST_USERS.find((u) => u.role === role);
    }

    if (!matchedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "User not found. Please select a valid test account.",
          },
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      ...matchedUser,
      issuedAt: Date.now(),
    };

    const cookieValue = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");
    const redirectUrl = getDefaultRedirectForRole(matchedUser.role);

    const res = NextResponse.json({
      success: true,
      data: {
        user: matchedUser,
        redirectUrl,
      },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      httpOnly: false, // Accessible on client if needed
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
