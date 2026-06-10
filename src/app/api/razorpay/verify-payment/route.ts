import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billing } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Subscription activate karo
    if (plan) {
      const owner = await getAuthenticatedOwner();
      if (owner) {
        const now = new Date();
        const endsAt = new Date(now);
        if (billing === "yearly") {
          endsAt.setFullYear(endsAt.getFullYear() + 1);
        } else {
          endsAt.setMonth(endsAt.getMonth() + 1);
        }
        await sql`
          UPDATE owners SET
            subscription_plan = ${plan.toLowerCase()},
            subscription_ends_at = ${endsAt.toISOString()},
            subscription_payment_id = ${razorpay_payment_id},
            subscription_billing = ${billing || 'monthly'}
          WHERE id = ${owner.ownerId}
        `;
      }
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
