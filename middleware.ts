import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession, ADMIN_COOKIE_NAME } from "@/lib/server/admin-session";

// Nome canônico do cookie administrativo do ProspectaNicho: prospecta_admin_session
const adminCookieName = ADMIN_COOKIE_NAME;

function isAdminLogin(pathname: string) {
  return pathname === "/admin/login";
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminPath(pathname) || isAdminLogin(pathname)) return NextResponse.next();

  const cookie = request.cookies.get(adminCookieName)?.value;
  if (!cookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 1. Verify signed HMAC admin session
  const session = await verifyAdminSession(cookie);
  if (session && session.role) {
    return NextResponse.next();
  }

  // 2. Break-glass compatibility if token login is explicitly permitted
  const allowBreakGlass =
    process.env.ENABLE_BREAK_GLASS_ADMIN === "true" ||
    process.env.NODE_ENV !== "production";
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (allowBreakGlass && expectedToken && cookie === expectedToken) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
