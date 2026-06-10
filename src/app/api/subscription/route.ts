import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await sql`
      SELECT subscription_plan, trial_starts_at, subscription_ends_at, subscription_billing
      FROM owners WHERE id = ${owner.ownerId}
    `;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const o = rows[0];
    const now = new Date();

    // Trial expiry: 7 days from trial_starts_at
    const trialStart = o.trial_starts_at ? new Date(o.trial_starts_at) : new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);

    const isOnTrial = o.subscription_plan === "trial";
    const trialExpired = isOnTrial && now > trialEnd;
    const subscriptionActive = o.subscription_plan !== "trial" &&
      o.subscription_ends_at && new Date(o.subscription_ends_at) > now;

    return NextResponse.json({
      plan: o.subscription_plan,
      trialStartsAt: trialStart,
      trialEndsAt: trialEnd,
      subscriptionEndsAt: o.subscription_ends_at,
      billing: o.subscription_billing,
      isOnTrial,
      trialExpired,
      subscriptionActive,
      accessAllowed: !trialExpired || subscriptionActive,
      trialDaysLeft: isOnTrial ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000*60*60*24))) : 0,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, paymentId, billing } = await request.json();
    if (!plan || !paymentId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const now = new Date();
    const endsAt = new Date(now);
    if (billing === "yearly") {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    await sql`
      UPDATE owners SET
        subscription_plan = ${plan},
        subscription_ends_at = ${endsAt.toISOString()},
        subscription_payment_id = ${paymentId},
        subscription_billing = ${billing || 'monthly'}
      WHERE id = ${owner.ownerId}
    `;

    return NextResponse.json({ success: true, endsAt });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
