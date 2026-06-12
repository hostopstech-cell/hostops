import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/pricing-data";

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billing,
      amount,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Signature verify karo
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Owner check karo
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (plan) {
      const planKey = plan.toLowerCase();
      const limits = PLAN_LIMITS[planKey] || { properties: 1, staff: 1 };

      const now = new Date();
      const endsAt = new Date(now);
      if (billing === "6month") {
        endsAt.setMonth(endsAt.getMonth() + 6);
      } else {
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      // Owners table update karo
      await sql`
        UPDATE owners SET
          subscription_plan = ${planKey},
          subscription_ends_at = ${endsAt.toISOString()},
          subscription_payment_id = ${razorpay_payment_id},
          subscription_billing = ${billing || "monthly"},
          subscription_started_at = ${now.toISOString()},
          properties_limit = ${limits.properties},
          staff_limit = ${limits.staff}
        WHERE id = ${owner.ownerId}
      `;

      // Payment history save karo
      await sql`
        INSERT INTO payment_history (
          owner_id, razorpay_order_id, razorpay_payment_id,
          plan, billing_type, amount, status
        ) VALUES (
          ${owner.ownerId},
          ${razorpay_order_id},
          ${razorpay_payment_id},
          ${planKey},
          ${billing || "monthly"},
          ${amount || 0},
          'success'
        )
        ON CONFLICT (razorpay_payment_id) DO NOTHING
      `;
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
