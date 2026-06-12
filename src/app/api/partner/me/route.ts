import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get("hostops_agent_token")?.value;
    if (!token) return NextResponse.json({ agent: null }, { status: 200 });

    let payload: { agentId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { agentId: number };
    } catch {
      return NextResponse.json({ agent: null }, { status: 200 });
    }

    const rows = await sql`
      SELECT id, name, email, phone, referral_code, upi_id, bank_account, bank_ifsc, bank_name, bank_holder_name, total_earnings, total_paid, created_at
      FROM referral_agents WHERE id = ${payload.agentId} AND is_active = true
    `;
    if (!rows.length) return NextResponse.json({ agent: null }, { status: 200 });

    const a = rows[0];
    return NextResponse.json({
      agent: {
        id: a.id, name: a.name, email: a.email, phone: a.phone,
        referralCode: a.referral_code,
        upiId: a.upi_id, bankAccount: a.bank_account, bankIfsc: a.bank_ifsc,
        bankName: a.bank_name, bankHolderName: a.bank_holder_name,
        totalEarnings: parseFloat(a.total_earnings || 0),
        totalPaid: parseFloat(a.total_paid || 0),
        pendingAmount: parseFloat(a.total_earnings || 0) - parseFloat(a.total_paid || 0),
        createdAt: a.created_at,
      }
    });
  } catch {
    return NextResponse.json({ agent: null }, { status: 200 });
  }
}
