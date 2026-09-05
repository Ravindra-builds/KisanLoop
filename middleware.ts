import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, AuthUser } from "./lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files, Next.js internal paths, and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isDemoMode = process.env.DEMO_MODE !== "false";

  // In DEMO_MODE=true, allow direct access without mandatory login
  if (isDemoMode) {
    return NextResponse.next();
  }

  // In DEMO_MODE=false, check authentication cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let user: AuthUser | null = null;

  if (sessionCookie) {
    try {
      user = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
    } catch {
      user = null;
    }
  }

  // If not logged in and not already on /login, redirect to /login
  if (!user && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting /login, redirect to their role home
  if (user && pathname === "/login") {
    let target = "/";
    if (user.role === "EXPERT") target = "/expert";
    if (user.role === "GOVT") target = "/dashboard";
    if (user.role === "ADMIN") target = "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Territory protection (strict role boundary separation in non-demo mode)
  if (user) {
    // 1. Farmer can only access Farmer routes (/, /login, /passport, etc.), cannot enter /expert, /dashboard, /admin
    if (user.role === "FARMER") {
      if (
        pathname.startsWith("/expert") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 2. Expert can only access Expert routes
    if (user.role === "EXPERT") {
      if (
        pathname === "/" ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/expert", request.url));
      }
    }

    // 3. Govt can only access Government dashboard
    if (user.role === "GOVT") {
      if (
        pathname === "/" ||
        pathname.startsWith("/expert") ||
        pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
