import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AuthUser } from "./lib/auth/constants";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/api/auth(.*)",
  "/api/inngest(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  const isDemoMode = process.env.DEMO_MODE === "true";

  // In DEMO_MODE=true, allow direct access without mandatory login
  if (isDemoMode) {
    return NextResponse.next();
  }

  // 1. Check Clerk session
  const authObj = await auth();
  const userId = authObj?.userId;

  // 2. Check custom cookie session fallback
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let customUser: AuthUser | null = null;
  if (sessionCookie) {
    try {
      customUser = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
    } catch {
      customUser = null;
    }
  }

  const isAuthenticated = Boolean(userId || customUser);

  // If already logged in and visiting /login or /signup, redirect to home
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    let target = "/";
    if (customUser?.role === "EXPERT") target = "/expert";
    if (customUser?.role === "GOVT") target = "/dashboard";
    if (customUser?.role === "ADMIN") target = "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If public route, let through
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // If not logged in, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role territory protection for custom session user
  if (customUser) {
    if (customUser.role === "FARMER") {
      if (
        pathname.startsWith("/expert") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } else if (customUser.role === "EXPERT") {
      if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/expert", request.url));
      }
    } else if (customUser.role === "GOVT") {
      if (pathname === "/" || pathname.startsWith("/expert") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

