import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const masked = user[0] + "*".repeat(Math.max(user.length - 2, 1)) + (user.length > 1 ? user[user.length - 1] : "");
  return `${masked}@${domain}`;
}

export async function GET() {
  try {
    const token = cookies().get("hostops_agent_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload: { agentId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { agentId: number };
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = payload.agentId;

    // Leads with payout details
    const leads = await sql`
      SELECT 
        rl.id, rl.prospect_email, rl.prospect_name, rl.status, rl.payment_status,
        rl.plan_name, rl.plan_amount, rl.billing_type,
        rl.commission_percent, rl.commission_amount,
        rl.created_at, rl.onboarded_at, rl.paid_at,
        rl.payment_note,
        rp.transaction_ref,
        rp.note as payout_note,
        o.name as owner_name, o.owner_number, o.subscription_plan
      FROM referral_leads rl
      LEFT JOIN owners o ON o.id = rl.owner_id
      LEFT JOIN referral_payouts rp ON rp.lead_id = rl.id
      WHERE rl.agent_id = ${agentId}
      ORDER BY rl.created_at DESC
    `;

    // All commission events (first + renewal) with lead info
    const commissionEvents = await sql`
      SELECT 
        ce.id, ce.lead_id, ce.event_type, ce.plan_name, ce.plan_amount,
        ce.billing_type, ce.commission_percent, ce.commission_amount,
        ce.payment_status, ce.transaction_ref, ce.note, ce.paid_at, ce.created_at,
        ce.razorpay_payment_id,
        rl.prospect_email, rl.prospect_name, rl.onboarded_at,
        o.name as owner_name
      FROM referral_commission_events ce
      JOIN referral_leads rl ON rl.id = ce.lead_id
      LEFT JOIN owners o ON o.id = rl.owner_id
      WHERE ce.agent_id = ${agentId}
      ORDER BY ce.created_at DESC
    `;

    // Stats calculated from commission_events (single source of truth)
    const totalCommission = commissionEvents.reduce((sum: number, e: any) => sum + parseFloat(String(e.commission_amount || 0)), 0);
    const totalPaid = commissionEvents.filter((e: any) => e.payment_status === "paid").reduce((sum: number, e: any) => sum + parseFloat(String(e.commission_amount || 0)), 0);
    const pendingPayout = totalCommission - totalPaid;

    const totalLeads = leads.length;
    const converted = leads.filter((l: any) => l.status === "onboarded").length;
    const pending = leads.filter((l: any) => l.status === "pending").length;

    return NextResponse.json({
      leads: leads.map((l: any) => ({
        ...l,
        prospect_email: maskEmail(l.prospect_email),
        commission_amount: parseFloat(String(l.commission_amount || 0)),
        plan_amount: parseFloat(String(l.plan_amount || 0)),
      })),
      commissionEvents: commissionEvents.map((e: any) => ({
        ...e,
        prospect_email: maskEmail(e.prospect_email),
        commission_amount: parseFloat(String(e.commission_amount || 0)),
        plan_amount: parseFloat(String(e.plan_amount || 0)),
      })),
      stats: {
        totalLeads,
        converted,
        pending,
        totalCommission,
        totalPaid,
        pendingPayout,
      }
    });
  } catch (error) {
    console.error("Partner dashboard error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
