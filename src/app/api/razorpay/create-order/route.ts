import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Dial code → currency code mapping
const DIAL_TO_CURRENCY: Record<string, string> = {
  "+91": "INR", "+1": "USD", "+44": "GBP", "+971": "AED",
  "+61": "AUD", "+65": "SGD", "+49": "EUR", "+33": "EUR",
  "+974": "QAR", "+966": "SAR",
};

// Fallback rates (agar API fail ho)
const FALLBACK_RATES: Record<string, number> = {
  INR: 1, USD: 84, GBP: 107, EUR: 91, AED: 23,
  AUD: 55, SGD: 63, QAR: 23, SAR: 22,
};

async function getExchangeRate(fromCurrency: string): Promise<number> {
  if (fromCurrency === "INR") return 1;
  try {
    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      { next: { revalidate: 3600 } } // 1 hour cache
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.rates?.INR || FALLBACK_RATES[fromCurrency] || 84;
  } catch {
    return FALLBACK_RATES[fromCurrency] || 84;
  }
}

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR", receipt, notes, dialCode } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // User ki currency detect karo
    const userCurrency = dialCode
      ? (DIAL_TO_CURRENCY[dialCode] || "USD")
      : (currency || "INR");

    // INR mein convert karo
    const exchangeRate = await getExchangeRate(userCurrency);
    const amountInINR = Math.round(amount * exchangeRate);

    console.log(`Payment: ${amount} ${userCurrency} → ₹${amountInINR} INR (rate: ${exchangeRate})`);

    const order = await razorpay.orders.create({
      amount: amountInINR * 100, // paise mein
      currency: "INR",           // Razorpay ko hamesha INR
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        originalAmount: amount,
        originalCurrency: userCurrency,
        exchangeRate: exchangeRate,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      originalAmount: amount,
      originalCurrency: userCurrency,
      exchangeRate,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
