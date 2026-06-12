import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("hostops_token")?.value;
    if (!token) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }

    const rows = await sql`
      SELECT id, name, email, phone,
             subscription_plan, created_at,
             trial_starts_at, subscription_ends_at, subscription_billing
      FROM owners WHERE id = ${payload.ownerId}
    `;

    if (!rows.length) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }

    const o = rows[0];
    return NextResponse.json({
      owner: {
        ownerId: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone || null,
        plan: o.subscription_plan || "trial",
        memberSince: o.created_at,
        subscriptionEndsAt: o.subscription_ends_at,
        billing: o.subscription_billing,
      }
    }, { status: 200 });
  } catch {
    return NextResponse.json({ owner: null }, { status: 200 });
  }
}
