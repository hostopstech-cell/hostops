import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_OWNER_ID = 3; // Tera owner ID — pehla registered owner

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner || owner.ownerId !== ADMIN_OWNER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await sql`
      SELECT 
        ra.id, ra.name, ra.email, ra.phone, ra.referral_code,
        ra.upi_id, ra.bank_account, ra.bank_ifsc, ra.bank_name, ra.bank_holder_name,
        ra.total_earnings, ra.total_paid, ra.is_active, ra.created_at,
        COUNT(rl.id) as total_leads,
        COUNT(CASE WHEN rl.status = 'onboarded' THEN 1 END) as converted_leads,
        COALESCE(SUM(rl.commission_amount), 0) as total_commission,
        COALESCE(SUM(CASE WHEN rl.payment_status = 'paid' THEN rl.commission_amount ELSE 0 END), 0) as paid_commission
      FROM referral_agents ra
      LEFT JOIN referral_leads rl ON rl.agent_id = ra.id
      GROUP BY ra.id
      ORDER BY ra.created_at DESC
    `;

    const leads = await sql`
      SELECT 
        rl.id, rl.agent_id, rl.prospect_email, rl.prospect_name,
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

    return NextResponse.json({ agents, leads });
  } catch (error) {
    console.error("Admin referrals error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
