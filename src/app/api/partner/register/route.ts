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
    const { name, email, phone, password, upi_id, bank_account, bank_ifsc, bank_name, bank_holder_name } = await request.json();

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: "Name, email, phone and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM referral_agents WHERE email = ${email.toLowerCase().trim()}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Unique referral code generate karo
    let referralCode = generateReferralCode(name);
    let attempts = 0;
    while (attempts < 10) {
      const codeCheck = await sql`SELECT id FROM referral_agents WHERE referral_code = ${referralCode}`;
      if (codeCheck.length === 0) break;
      referralCode = generateReferralCode(name);
      attempts++;
    }

    const rows = await sql`
      INSERT INTO referral_agents (name, email, phone, password_hash, referral_code, upi_id, bank_account, bank_ifsc, bank_name, bank_holder_name)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${phone.trim()}, ${passwordHash}, ${referralCode}, ${upi_id || null}, ${bank_account || null}, ${bank_ifsc || null}, ${bank_name || null}, ${bank_holder_name || null})
      RETURNING id, name, email, phone, referral_code, created_at
    `;

    const agent = rows[0];
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
    console.error("Partner register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
