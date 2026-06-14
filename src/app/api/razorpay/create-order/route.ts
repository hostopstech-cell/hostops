import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Dial code → Razorpay-supported currency code
// Note: Razorpay supports these international currencies with international card payments enabled
const DIAL_TO_CURRENCY: Record<string, string> = {
  "+91":  "INR",
  "+1":   "USD",
  "+44":  "GBP",
  "+971": "AED",
  "+61":  "AUD",
  "+65":  "SGD",
  "+49":  "EUR",
  "+33":  "EUR",
  "+974": "QAR",
  "+966": "SAR",
};

// Razorpay amount multiplier — most currencies use 2 decimal places (×100)
// Some currencies like JPY use 0 decimal places (×1) — but we don't support those here
const AMOUNT_MULTIPLIER = 100; // paise / cents / fils etc.

export async function POST(request: Request) {
  try {
    const { amount, receipt, notes, dialCode } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // User ki actual currency — no conversion needed
    const currency = dialCode
      ? (DIAL_TO_CURRENCY[dialCode] || "USD")
      : "INR";

    const amountInSmallestUnit = Math.round(amount * AMOUNT_MULTIPLIER);

    console.log(`Payment order: ${amount} ${currency} (${amountInSmallestUnit} smallest units)`);

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency,          // ✅ User ki actual currency
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        originalAmount: amount,
        originalCurrency: currency,
        dialCode: dialCode || "+91",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,       // e.g. "USD", "GBP", "INR"
      originalAmount: amount,
      originalCurrency: currency,
    });
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: error?.error?.description || "Failed to create order" },
      { status: 500 }
    );
  }
}
