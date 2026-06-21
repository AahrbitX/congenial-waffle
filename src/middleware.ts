import { NextRequest, NextResponse } from "next/server";

// Better Auth session cookie (cookiePrefix: "mohan-cabs")
// In production, Better Auth prefixes cookies with "__Secure-" when NODE_ENV=production.
// Check both names so the middleware works in dev and production.
const SESSION_COOKIE = "mohan-cabs.session_token";
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;
const ROLE_COOKIE = "mohan-cabs.user_role";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE) ?? request.cookies.get(SECURE_SESSION_COOKIE);

  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For /admin routes: also require the role cookie to equal "admin".
  // The role cookie is set client-side after login. If missing or not "admin",
  // redirect to /dashboard. Backend APIs are still protected by requireAdmin.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const role = request.cookies.get(ROLE_COOKIE)?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
