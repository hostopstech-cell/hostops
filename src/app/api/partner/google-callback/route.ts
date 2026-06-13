import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function generateReferralCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5).padEnd(3, "X");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${rand}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!code) return NextResponse.redirect(`${baseUrl}/partner?error=no_code`);

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/partner/google-callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return NextResponse.redirect(`${baseUrl}/partner?error=token_failed`);

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json();
    const email = userInfo.email?.toLowerCase();
    const name = userInfo.name;

    if (!email) return NextResponse.redirect(`${baseUrl}/partner?error=no_email`);

    // Block if already an owner
    const ownerCheck = await sql`SELECT id FROM owners WHERE email = ${email}`;
    if (ownerCheck.length > 0) {
      return NextResponse.redirect(`${baseUrl}/partner?error=owner_account`);
    }

    // Find or create partner
    let agent;
    const rows = await sql`SELECT * FROM referral_agents WHERE email = ${email}`;
    if (rows.length === 0) {
      let referralCode = generateReferralCode(name || email);
      for (let i = 0; i < 10; i++) {
        const check = await sql`SELECT id FROM referral_agents WHERE referral_code = ${referralCode}`;
        if (check.length === 0) break;
        referralCode = generateReferralCode(name || email);
      }
      const newAgent = await sql`
        INSERT INTO referral_agents (name, email, password_hash, referral_code, is_active)
        VALUES (${name || "Partner"}, ${email}, ${"google-auth"}, ${referralCode}, true)
        RETURNING *
      `;
      agent = newAgent[0];
    } else {
      agent = rows[0];
      if (!agent.is_active) return NextResponse.redirect(`${baseUrl}/partner?error=inactive`);
    }

    const token = jwt.sign(
      { agentId: agent.id, email: agent.email, name: agent.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.redirect(`${baseUrl}/partner/dashboard`);
    // FIXED: use hostops_agent_token (same as me/route.ts checks)
    response.cookies.set("hostops_agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Partner Google callback error:", error);
    return NextResponse.redirect(`${baseUrl}/partner?error=server_error`);
  }
}
