import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const rows = await sql`SELECT * FROM referral_agents WHERE email = ${email.toLowerCase().trim()} AND is_active = true`;
    if (rows.length === 0) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const agent = rows[0];
    const valid = await bcrypt.compare(password, agent.password_hash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ agentId: agent.id, email: agent.email, name: agent.name }, JWT_SECRET, { expiresIn: "7d" });

    cookies().set("hostops_agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ agent: { id: agent.id, name: agent.name, email: agent.email, referralCode: agent.referral_code } });
  } catch (error) {
    console.error("Partner login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
