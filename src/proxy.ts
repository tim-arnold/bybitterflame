import { NextRequest, NextResponse } from "next/server";

// Middleware runs in the Edge Runtime where getCloudflareContext is unavailable.
// Use a lightweight cookie-presence check here; full session validation happens
// inside each protected API route via requireSession().
export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/play/:path*", "/create", "/adventures/:path*"],
};
