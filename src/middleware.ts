import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedDashboard =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/subscription") &&
    !pathname.startsWith("/dashboard/trial-expired");

  if (!isProtectedDashboard) return NextResponse.next();

  const token = request.cookies.get("hostops_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const subRes = await fetch(new URL("/api/subscription", request.url), {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (subRes.ok) {
      const sub = await subRes.json();
      // Block only if hardBlocked (not in grace period, not active, trial expired)
      if (sub.hardBlocked) {
        return NextResponse.redirect(new URL("/dashboard/trial-expired", request.url));
      }
    }
  } catch {
    // Graceful degradation — allow access on error
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
