import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("hostops_token")?.value;
    if (!token) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }
    const owner = verifyToken(token);
    if (!owner) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }
    return NextResponse.json({ owner }, { status: 200 });
  } catch {
    return NextResponse.json({ owner: null }, { status: 200 });
  }
}
