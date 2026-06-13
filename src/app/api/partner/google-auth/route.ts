import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function generateReferralCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5).padEnd(3, "X");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${rand}`;
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const emailClean = email.toLowerCase().trim();

    // Block if already an owner
    const ownerCheck = await sql`SELECT id FROM owners WHERE email = ${emailClean}`;
    if (ownerCheck.length > 0) {
      return NextResponse.json({ error: "This Google account is already registered as a property owner." }, { status: 409 });
    }

    let agent;
    const rows = await sql`SELECT * FROM referral_agents WHERE email = ${emailClean}`;

    if (rows.length === 0) {
      let referralCode = generateReferralCode(name || email);
      for (let i = 0; i < 10; i++) {
        const check = await sql`SELECT id FROM referral_agents WHERE referral_code = ${referralCode}`;
        if (check.length === 0) break;
        referralCode = generateReferralCode(name || email);
      }
      const newAgent = await sql`
        INSERT INTO referral_agents (name, email, password_hash, referral_code, is_active)
        VALUES (${name || "Partner"}, ${emailClean}, ${"google-auth"}, ${referralCode}, true)
        RETURNING *
      `;
      agent = newAgent[0];
    } else {
      agent = rows[0];
      if (!agent.is_active) {
        return NextResponse.json({ error: "Your partner account is inactive. Please contact support." }, { status: 403 });
      }
    }

    const token = jwt.sign(
      { agentId: agent.id, email: agent.email, name: agent.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // FIXED: use hostops_agent_token consistently
    cookies().set("hostops_agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Partner Google auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
