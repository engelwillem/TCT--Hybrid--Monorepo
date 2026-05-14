import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "wa_session_token";
const protectedPaths = ["/dashboard", "/reminders", "/templates", "/settings"];

function isProtected(pathname: string): boolean {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/reminders/:path*", "/templates/:path*", "/settings/:path*"],
};
