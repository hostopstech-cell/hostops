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
    const { lead_id, transaction_ref, note, commission_amount } = await request.json();
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    const leadRows = await sql`SELECT * FROM referral_leads WHERE id = ${lead_id}`;
    if (!leadRows.length) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const lead = leadRows[0];
    if (lead.payment_status === "paid") return NextResponse.json({ error: "Already marked as paid" }, { status: 409 });
    const finalAmount = parseFloat(String(commission_amount || lead.commission_amount || 0));
    await sql`UPDATE referral_leads SET payment_status = 'paid', paid_at = NOW(), payment_note = ${note || null} WHERE id = ${lead_id}`;
    await sql`INSERT INTO referral_payouts (agent_id, lead_id, amount, transaction_ref, note) VALUES (${lead.agent_id}, ${lead_id}, ${finalAmount}, ${transaction_ref || null}, ${note || null})`;
    await sql`UPDATE referral_agents SET total_paid = total_paid + ${finalAmount} WHERE id = ${lead.agent_id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark paid error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
