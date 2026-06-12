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

    const { upi_id, bank_account, bank_ifsc, bank_name, bank_holder_name } = await request.json();

    await sql`
      UPDATE referral_agents SET
        upi_id = ${upi_id || null},
        bank_account = ${bank_account || null},
        bank_ifsc = ${bank_ifsc || null},
        bank_name = ${bank_name || null},
        bank_holder_name = ${bank_holder_name || null}
      WHERE id = ${payload.agentId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
