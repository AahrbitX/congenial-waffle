import { NextRequest, NextResponse } from "next/server";

// Better Auth session cookie (cookiePrefix: "mohan-cabs")
const SESSION_COOKIE = "mohan-cabs.session_token";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
