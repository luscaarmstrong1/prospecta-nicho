import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "prospecta_admin_session";

function isAdminLogin(pathname: string) {
  return pathname === "/admin/login";
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminPath(pathname) || isAdminLogin(pathname)) return NextResponse.next();

  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "missing-token");
    return NextResponse.redirect(url);
  }

  const cookie = request.cookies.get(adminCookieName)?.value;
  if (cookie === expected) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
