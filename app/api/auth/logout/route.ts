import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear KisanLoop custom session cookie
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  // Clear selected role cookie
  res.cookies.set({
    name: "kisanloop_selected_role",
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
}
