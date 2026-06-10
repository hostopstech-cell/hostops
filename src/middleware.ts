import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only dashboard routes check karo (subscription aur trial-expired ko bypass karo)
  const isProtectedDashboard =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/subscription") &&
    !pathname.startsWith("/dashboard/trial-expired");

  if (!isProtectedDashboard) return NextResponse.next();

  // Auth cookie check
  const token = request.cookies.get("hostops_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  // Subscription check API call
  try {
    const subRes = await fetch(new URL("/api/subscription", request.url), {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (subRes.ok) {
      const sub = await subRes.json();
      if (sub.trialExpired && !sub.subscriptionActive) {
        return NextResponse.redirect(new URL("/dashboard/trial-expired", request.url));
      }
    }
  } catch (e) {
    // Error pe block mat karo — graceful degradation
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
