import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  if (pathname === "/auth" && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/room") && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/room/(.+)"],
};
