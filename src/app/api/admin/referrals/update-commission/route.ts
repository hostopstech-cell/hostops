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

    const { lead_id, commission_percent, commission_amount } = await request.json();
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    await sql`
      UPDATE referral_leads SET
        commission_percent = ${commission_percent || 0},
        commission_amount = ${commission_amount || 0}
      WHERE id = ${lead_id}
    `;

    // Agent total_earnings recalculate karo
    const leadRows = await sql`SELECT agent_id FROM referral_leads WHERE id = ${lead_id}`;
    if (leadRows.length) {
      await sql`
        UPDATE referral_agents SET
          total_earnings = (
            SELECT COALESCE(SUM(commission_amount), 0) 
            FROM referral_leads 
            WHERE agent_id = ${leadRows[0].agent_id}
          )
        WHERE id = ${leadRows[0].agent_id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update commission error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
