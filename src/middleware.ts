import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "kindsight_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only target /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = pathname === "/admin/login";
    const isSetupPage = pathname === "/admin/setup";

    // Basic session validation
    let isValidSession = false;
    let isExpired = false;

    if (sessionCookie) {
      try {
        const [base64Payload] = sessionCookie.split(".");
        if (base64Payload) {
          const b64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
          const payloadStr = atob(b64);
          const payload = JSON.parse(payloadStr);
          if (payload.expiresAt) {
            if (payload.expiresAt > Date.now()) {
              isValidSession = true;
            } else {
              isExpired = true;
            }
          }
        }
      } catch {
        isValidSession = false;
      }
    }

    // Allow setup page for first-time admin creation
    if (isSetupPage) {
      if (isValidSession) {
        return NextResponse.redirect(new URL("/admin/posts", request.url));
      }
      return NextResponse.next();
    }

    // 1. If visiting /admin/login while already authenticated, redirect to /admin/posts
    if (isLoginPage) {
      if (isValidSession) {
        return NextResponse.redirect(new URL("/admin/posts", request.url));
      }
      return NextResponse.next();
    }

    // 2. If visiting any other /admin page without valid session, redirect to /admin/login
    if (!isValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      if (isExpired || sessionCookie) {
        loginUrl.searchParams.set("reason", "expired");
      }
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) {
        response.cookies.delete(ADMIN_COOKIE_NAME);
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
