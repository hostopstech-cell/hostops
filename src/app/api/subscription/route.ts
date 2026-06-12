import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import { getSubStatus } from "@/lib/subscription-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = await getSubStatus(owner.ownerId);

    return NextResponse.json({
      plan: status.plan,
      trialEndsAt: status.trialEndsAt,
      subscriptionEndsAt: status.subscriptionEndsAt,
      isOnTrial: status.isOnTrial,
      trialExpired: status.trialExpired,
      trialDaysLeft: status.trialDaysLeft,
      trialHoursLeft: status.trialHoursLeft,
      subscriptionActive: status.subscriptionActive,
      inGracePeriod: status.inGracePeriod,
      accessAllowed: status.accessAllowed,
      hardBlocked: status.hardBlocked,
      subDaysLeft: status.subDaysLeft,
      subExpiringSoon: status.subExpiringSoon,
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
    if (billing === "6month") {
      endsAt.setMonth(endsAt.getMonth() + 6);
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
