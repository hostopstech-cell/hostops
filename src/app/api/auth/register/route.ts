import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, referralCode } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM owners WHERE email = ${email.toLowerCase().trim()}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // referral agent dhundo agar code diya hai
    let agentId: number | null = null;
    if (referralCode?.trim()) {
      const agents = await sql`
        SELECT id FROM referral_agents
        WHERE referral_code = ${referralCode.trim().toUpperCase()} AND is_active = true
      `;
      if (agents.length > 0) agentId = agents[0].id;
    }

    const passwordHash = await hashPassword(password);

    const rows = await sql`
      INSERT INTO owners (name, email, password_hash, referred_by_agent_id)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${passwordHash}, ${agentId})
      RETURNING id, name, email, created_at
    `;

    const owner = rows[0];

    // referral lead update karo agar agent mila
    if (agentId) {
      // existing lead update karo ya naya banao
      const existingLead = await sql`
        SELECT id FROM referral_leads
        WHERE agent_id = ${agentId} AND prospect_email = ${email.toLowerCase().trim()}
      `;

      if (existingLead.length > 0) {
        await sql`
          UPDATE referral_leads
          SET owner_id = ${owner.id}, status = 'onboarded', onboarded_at = NOW()
          WHERE id = ${existingLead[0].id}
        `;
      } else {
        await sql`
          INSERT INTO referral_leads (agent_id, prospect_email, prospect_name, owner_id, status, onboarded_at)
          VALUES (${agentId}, ${email.toLowerCase().trim()}, ${name.trim()}, ${owner.id}, 'onboarded', NOW())
        `;
      }
    }

    const token = signToken({
      ownerId: owner.id,
      email: owner.email,
      name: owner.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
      referralLinked: agentId !== null,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register owner" },
      { status: 500 }
    );
  }
}
