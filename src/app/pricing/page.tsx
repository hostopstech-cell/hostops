"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { plans } from "@/lib/pricing-data";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "6month">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    // Razorpay script load karo
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Owner check karo
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.owner) {
          setOwner(data.owner);
        }
      });

    // Current plan check karo
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan);
      })
      .catch(() => {});

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getPrice = (plan: (typeof plans)[0]) => {
    return billing === "monthly" ? plan.monthlyPrice : plan.sixMonthPrice;
  };

  const getDisplayPrice = (plan: (typeof plans)[0]) => {
    return billing === "monthly" ? plan.monthlyDisplay : plan.sixMonthDisplay;
  };

  const handlePurchase = async (plan: (typeof plans)[0]) => {
    if (!owner) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(plan.planKey);

    try {
      const amount = getPrice(plan);

      // Order create karo
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          receipt: `plan_${plan.planKey}_${Date.now()}`,
          notes: { plan: plan.planKey, billing },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.orderId) throw new Error("Order creation failed");

      // Razorpay checkout open karo
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HostOps",
        description: `${plan.name} Plan - ${billing === "monthly" ? "1 Mahina" : "6 Mahine"}`,
        order_id: orderData.orderId,
        prefill: {
          name: owner.name,
          email: owner.email,
        },
        theme: { color: "#ea580c" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.planKey,
                billing,
                amount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setCurrentPlan(plan.planKey);
              router.push("/dashboard?payment=success");
            } else {
              alert("Payment verify nahi ho saka. Support se contact karen.");
            }
          } catch {
            alert("Kuch galat hua. Support se contact karen.");
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Order create karne mein dikkat aayi. Dobara try karen.");
      setLoading(null);
    }
  };

  const isCurrentPlan = (planKey: string) => currentPlan === planKey;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🎉</span> Refer karein, 1 mahina free paaein
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Apna Plan Chunen
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Sab plans mein 7-din ka free trial. Koi credit card nahi chahiye.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-2xl p-1.5 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("6month")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === "6month"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              6 Mahine
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                1 Free
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className={`relative rounded-2xl border-2 ${plan.color} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "scale-105 shadow-xl" : ""
              }`}
            >
              {/* Badge */}
              <div className={`${plan.headerBg} px-6 pt-6 pb-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  <span className="text-2xl">{plan.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>

                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">
                      {getDisplayPrice(plan)}
                    </span>
                    {billing === "monthly" && (
                      <span className="text-slate-400 text-sm">/mahina</span>
                    )}
                  </div>
                  {billing === "6month" && (
                    <p className="text-green-600 text-xs font-semibold mt-1">
                      ✅ {plan.sixMonthSaving}
                    </p>
                  )}
                  {billing === "monthly" && (
                    <p className="text-slate-400 text-xs mt-1">
                      6 mahine mein{" "}
                      <span className="text-green-600 font-medium">
                        {plan.sixMonthSaving.split("(")[0].trim()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="px-6 py-4 bg-white">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          feature.included
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {feature.included ? "✓" : "✕"}
                      </span>
                      <span
                        className={`text-sm ${
                          feature.included ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {isCurrentPlan(plan.planKey) ? (
                  <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-green-100 text-green-700">
                    ✅ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={loading === plan.planKey}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${plan.buttonStyle} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.planKey ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Referral Banner */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
          <div className="text-3xl mb-3">🎁</div>
          <h3 className="text-xl font-bold mb-2">Referral Program</h3>
          <p className="text-orange-100 text-sm max-w-md mx-auto">
            Kisi property owner ko refer karen. Jab woh subscribe karen, aapko{" "}
            <strong className="text-white">1 mahina free</strong> milega!
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Koi sawaal hai?{" "}
            <a href="mailto:support@hostops.in" className="text-orange-600 font-medium hover:underline">
              support@hostops.in
            </a>{" "}
            par likhein
          </p>
        </div>
      </div>
    </div>
  );
}
