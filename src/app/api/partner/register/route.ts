import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
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
    const { name, email, phone, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: "Name, email, phone and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();

    // Block if already an owner
    const ownerCheck = await sql`SELECT id FROM owners WHERE email = ${emailClean}`;
    if (ownerCheck.length > 0) {
      return NextResponse.json({ error: "This email is already registered as a property owner. Please use a different email." }, { status: 409 });
    }

    // Block if partner already exists
    const existing = await sql`SELECT id FROM referral_agents WHERE email = ${emailClean}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "A partner account with this email already exists. Please login instead." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let referralCode = generateReferralCode(name);
    for (let i = 0; i < 10; i++) {
      const check = await sql`SELECT id FROM referral_agents WHERE referral_code = ${referralCode}`;
      if (check.length === 0) break;
      referralCode = generateReferralCode(name);
    }

    const rows = await sql`
      INSERT INTO referral_agents (name, email, phone, password_hash, referral_code, is_active)
      VALUES (${name.trim()}, ${emailClean}, ${phone.trim()}, ${passwordHash}, ${referralCode}, true)
      RETURNING id, name, email, phone, referral_code, created_at
    `;

    const agent = rows[0];
    const token = jwt.sign(
      { agentId: agent.id, email: agent.email, name: agent.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    cookies().set("hostops_agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        referralCode: agent.referral_code,
      }
    });
  } catch (error) {
    console.error("Partner register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
