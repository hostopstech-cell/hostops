import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function POST(request: Request) {
  try {
    const token = cookies().get("hostops_agent_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload: { agentId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { agentId: number };
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prospect_email, prospect_name } = await request.json();
    if (!prospect_email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const email = prospect_email.toLowerCase().trim();

    // Check: kya ye email already kisi owner ka hai?
    const existingOwner = await sql`SELECT id FROM owners WHERE email = ${email}`;
    if (existingOwner.length > 0) {
      return NextResponse.json({ error: "This email is already a registered property owner" }, { status: 409 });
    }

    // Check: kya ye email already is agent ke paas hai?
    const existingLead = await sql`
      SELECT id FROM referral_leads WHERE prospect_email = ${email} AND agent_id = ${payload.agentId}
    `;
    if (existingLead.length > 0) {
      return NextResponse.json({ error: "You have already added this email" }, { status: 409 });
    }

    // Check: kya ye email kisi aur agent ne bhi add ki hai?
    const otherAgent = await sql`
      SELECT ra.name FROM referral_leads rl 
      JOIN referral_agents ra ON ra.id = rl.agent_id
      WHERE rl.prospect_email = ${email} AND rl.status != 'lost'
    `;
    if (otherAgent.length > 0) {
      return NextResponse.json({ error: "This email has already been referred by another partner" }, { status: 409 });
    }

    const rows = await sql`
      INSERT INTO referral_leads (agent_id, prospect_email, prospect_name, status)
      VALUES (${payload.agentId}, ${email}, ${prospect_name?.trim() || null}, 'pending')
      RETURNING id, prospect_email, prospect_name, status, created_at
    `;

    return NextResponse.json({ success: true, lead: rows[0] });
  } catch (error) {
    console.error("Add lead error:", error);
    return NextResponse.json({ error: "Failed to add lead" }, { status: 500 });
  }
}
