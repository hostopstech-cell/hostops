import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function verifyAdminToken() {
  const token = cookies().get("hostops_admin_token")?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    return payload.role === "admin";
  } catch { return false; }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminToken()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { agent_id, is_active } = await request.json();
    await sql`UPDATE referral_agents SET is_active = ${is_active} WHERE id = ${agent_id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
