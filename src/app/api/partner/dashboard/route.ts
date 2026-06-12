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

    // Leads with owner info
    const leads = await sql`
      SELECT 
        rl.id, rl.prospect_email, rl.prospect_name, rl.status, rl.payment_status,
        rl.plan_name, rl.plan_amount, rl.billing_type,
        rl.commission_percent, rl.commission_amount,
        rl.created_at, rl.onboarded_at, rl.paid_at,
        o.name as owner_name, o.owner_number, o.subscription_plan
      FROM referral_leads rl
      LEFT JOIN owners o ON o.id = rl.owner_id
      WHERE rl.agent_id = ${agentId}
      ORDER BY rl.created_at DESC
    `;

    // Summary stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'onboarded' THEN 1 END) as converted,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COALESCE(SUM(commission_amount), 0) as total_commission,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN commission_amount ELSE 0 END), 0) as total_paid
      FROM referral_leads WHERE agent_id = ${agentId}
    `;

    const s = stats[0];

    return NextResponse.json({
      leads: leads.map(l => ({
        ...l,
        prospect_email: maskEmail(l.prospect_email),
        commission_amount: parseFloat(l.commission_amount || 0),
        plan_amount: parseFloat(l.plan_amount || 0),
      })),
      stats: {
        totalLeads: parseInt(s.total_leads),
        converted: parseInt(s.converted),
        pending: parseInt(s.pending),
        totalCommission: parseFloat(s.total_commission),
        totalPaid: parseFloat(s.total_paid),
        pendingPayout: parseFloat(s.total_commission) - parseFloat(s.total_paid),
      }
    });
  } catch (error) {
    console.error("Partner dashboard error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
