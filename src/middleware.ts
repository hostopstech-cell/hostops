import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hostops_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
