import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

const ADMIN_OWNER_ID = 3;

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner || owner.ownerId !== ADMIN_OWNER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lead_id, transaction_ref, note, commission_amount } = await request.json();
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    // Lead fetch karo
    const leadRows = await sql`SELECT * FROM referral_leads WHERE id = ${lead_id}`;
    if (!leadRows.length) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const lead = leadRows[0];

    if (lead.payment_status === 'paid') {
      return NextResponse.json({ error: "This lead commission is already marked as paid" }, { status: 409 });
    }

    const finalAmount = commission_amount || lead.commission_amount || 0;

    // Lead update karo
    await sql`
      UPDATE referral_leads SET
        payment_status = 'paid',
        paid_at = NOW(),
        payment_note = ${note || null}
      WHERE id = ${lead_id}
    `;

    // Payout record create karo
    await sql`
      INSERT INTO referral_payouts (agent_id, lead_id, amount, transaction_ref, note)
      VALUES (${lead.agent_id}, ${lead_id}, ${finalAmount}, ${transaction_ref || null}, ${note || null})
    `;

    // Agent ke total_paid update karo
    await sql`
      UPDATE referral_agents SET
        total_paid = total_paid + ${finalAmount}
      WHERE id = ${lead.agent_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark paid error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
