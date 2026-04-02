import { NextResponse } from "next/server";

export function proxy(req) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/socket.io")) return NextResponse.next();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
