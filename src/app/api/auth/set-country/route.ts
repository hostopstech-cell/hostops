import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("hostops_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { countryCode } = await request.json();
    if (!countryCode) return NextResponse.json({ error: "countryCode required" }, { status: 400 });
    await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+91'`;
    await sql`UPDATE owners SET country_code = ${countryCode} WHERE id = ${payload.ownerId}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
