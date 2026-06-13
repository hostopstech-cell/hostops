import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/pricing-data";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billing, amount } = await request.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex");
    if (expectedSignature !== razorpay_signature)
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (plan) {
      const planKey = plan.toLowerCase();
      const limits = PLAN_LIMITS[planKey] || { properties: 1, staff: 1 };
      const now = new Date();
      const endsAt = new Date(now);
      if (billing === "6month") endsAt.setMonth(endsAt.getMonth() + 6);
      else endsAt.setMonth(endsAt.getMonth() + 1);

      await sql`UPDATE owners SET subscription_plan = ${planKey}, subscription_ends_at = ${endsAt.toISOString()}, subscription_payment_id = ${razorpay_payment_id}, subscription_billing = ${billing || "monthly"}, subscription_started_at = COALESCE(subscription_started_at, ${now.toISOString()}), properties_limit = ${limits.properties}, staff_limit = ${limits.staff} WHERE id = ${owner.ownerId}`;

      await sql`INSERT INTO payment_history (owner_id, razorpay_order_id, razorpay_payment_id, plan, billing_type, amount, status) VALUES (${owner.ownerId}, ${razorpay_order_id}, ${razorpay_payment_id}, ${planKey}, ${billing || "monthly"}, ${amount || 0}, 'success') ON CONFLICT (razorpay_payment_id) DO NOTHING`;

      try {
        const ownerData = await sql`SELECT email FROM owners WHERE id = ${owner.ownerId}`;
        if (ownerData.length) {
          const ownerEmail = ownerData[0].email;
          const leadRows = await sql`SELECT rl.* FROM referral_leads rl JOIN referral_agents ra ON ra.id = rl.agent_id WHERE rl.prospect_email = ${ownerEmail} AND rl.status != 'lost' ORDER BY rl.created_at ASC LIMIT 1`;

          if (leadRows.length) {
            const lead = leadRows[0];
            const paidAmount = parseFloat(String(amount || 0));
            const isFirstPayment = !lead.onboarded_at;

            if (isFirstPayment) {
              // 40% first payment commission
              const commissionAmount = Math.round(paidAmount * 0.4);
              await sql`UPDATE referral_leads SET status = 'onboarded', owner_id = ${owner.ownerId}, plan_name = ${planKey}, plan_amount = ${paidAmount}, billing_type = ${billing || 'monthly'}, commission_percent = 40, commission_amount = ${commissionAmount}, onboarded_at = NOW() WHERE id = ${lead.id}`;
              await sql`INSERT INTO referral_commission_events (lead_id, agent_id, event_type, plan_name, plan_amount, billing_type, commission_percent, commission_amount, payment_status, razorpay_payment_id) VALUES (${lead.id}, ${lead.agent_id}, 'first', ${planKey}, ${paidAmount}, ${billing || 'monthly'}, 40, ${commissionAmount}, 'unpaid', ${razorpay_payment_id}) ON CONFLICT DO NOTHING`;
              await sql`UPDATE referral_agents SET total_earnings = (SELECT COALESCE(SUM(commission_amount),0) FROM referral_commission_events WHERE agent_id = ${lead.agent_id}) WHERE id = ${lead.agent_id}`;
              await sql`UPDATE owners SET referred_by_agent_id = ${lead.agent_id} WHERE id = ${owner.ownerId}`;
            } else {
              // 20% renewal commission (within 1 year)
              const oneYearLater = new Date(lead.onboarded_at);
              oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
              if (now < oneYearLater) {
                const commissionAmount = Math.round(paidAmount * 0.2);
                await sql`INSERT INTO referral_commission_events (lead_id, agent_id, event_type, plan_name, plan_amount, billing_type, commission_percent, commission_amount, payment_status, razorpay_payment_id) VALUES (${lead.id}, ${lead.agent_id}, 'renewal', ${planKey}, ${paidAmount}, ${billing || 'monthly'}, 20, ${commissionAmount}, 'unpaid', ${razorpay_payment_id}) ON CONFLICT DO NOTHING`;
                await sql`UPDATE referral_agents SET total_earnings = (SELECT COALESCE(SUM(commission_amount),0) FROM referral_commission_events WHERE agent_id = ${lead.agent_id}) WHERE id = ${lead.agent_id}`;
              }
            }
          }
        }
      } catch (refErr) {
        console.error("Referral update error (non-critical):", refErr);
      }
    }
    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
