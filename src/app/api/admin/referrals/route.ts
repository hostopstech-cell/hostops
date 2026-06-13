import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
const JWT_SECRET = process.env.JWT_SECRET ?? "";

function verifyAdminToken() {
  const token = cookies().get("hostops_admin_token")?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    return payload.role === "admin";
  } catch { return false; }
}

export async function GET() {
  try {
    if (!verifyAdminToken()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agents = await sql`
      SELECT ra.id, ra.name, ra.email, ra.phone, ra.referral_code,
        ra.upi_id, ra.bank_account, ra.bank_ifsc, ra.bank_name, ra.bank_holder_name,
        ra.total_earnings, ra.total_paid, ra.is_active, ra.created_at,
        COUNT(DISTINCT rl.id) as total_leads,
        COUNT(DISTINCT CASE WHEN rl.status = 'onboarded' THEN rl.id END) as converted_leads,
        COALESCE(SUM(ce.commission_amount), 0) as total_commission,
        COALESCE(SUM(CASE WHEN ce.payment_status = 'paid' THEN ce.commission_amount ELSE 0 END), 0) as paid_commission
      FROM referral_agents ra
      LEFT JOIN referral_leads rl ON rl.agent_id = ra.id
      LEFT JOIN referral_commission_events ce ON ce.agent_id = ra.id
      GROUP BY ra.id ORDER BY ra.created_at DESC
    `;

    const leads = await sql`
      SELECT rl.id, rl.agent_id, rl.prospect_email, rl.prospect_name,
        rl.status, rl.payment_status, rl.plan_name, rl.plan_amount,
        rl.billing_type, rl.commission_percent, rl.commission_amount,
        rl.created_at, rl.onboarded_at, rl.paid_at, rl.payment_note,
        ra.name as agent_name, ra.referral_code,
        o.name as owner_name, o.owner_number, o.subscription_plan
      FROM referral_leads rl
      JOIN referral_agents ra ON ra.id = rl.agent_id
      LEFT JOIN owners o ON o.id = rl.owner_id
      ORDER BY rl.created_at DESC
    `;

    const commissionEvents = await sql`
      SELECT ce.id, ce.lead_id, ce.agent_id, ce.event_type, ce.plan_name,
        ce.plan_amount, ce.billing_type, ce.commission_percent, ce.commission_amount,
        ce.payment_status, ce.transaction_ref, ce.note, ce.paid_at, ce.created_at,
        ra.name as agent_name, ra.referral_code,
        rl.prospect_email, rl.prospect_name,
        o.name as owner_name
      FROM referral_commission_events ce
      JOIN referral_agents ra ON ra.id = ce.agent_id
      JOIN referral_leads rl ON rl.id = ce.lead_id
      LEFT JOIN owners o ON o.id = rl.owner_id
      ORDER BY ce.created_at DESC
    `;

    return NextResponse.json({ agents, leads, commissionEvents });
  } catch (error) {
    console.error("Admin referrals error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
