"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { plans } from "@/lib/pricing-data";

declare global { interface Window { Razorpay: any; } }

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-gray-900 tabular-nums w-10 text-center">{String(value).padStart(2, "0")}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<"monthly" | "6month">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [subData, setSubData] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetch("/api/subscription").then(r => r.json()).then(setSubData).catch(() => {});
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.owner) setOwnerData(d.owner); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!subData?.trialEndsAt) return;
    const calc = () => {
      const diff = new Date(subData.trialEndsAt).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [subData]);

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async (plan: typeof plans[0]) => {
    setLoading(plan.planKey);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Razorpay load nahi hua."); setLoading(null); return; }

      const amount = billing === "monthly" ? plan.monthlyPrice : plan.sixMonthPrice;

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          receipt: `hostops_${plan.planKey}_${Date.now()}`,
          notes: { plan: plan.planKey, billing },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "HostOps",
        description: `${plan.name} Plan - ${billing === "6month" ? "6 Mahine" : "1 Mahina"}`,
        order_id: data.orderId,
        prefill: {
          name: ownerData?.name || "",
          email: ownerData?.email || "",
        },
        theme: { color: "#ea580c" },
        handler: async (response: any) => {
          const verify = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              plan: plan.planKey,
              billing,
              amount,
            }),
          });
          const verifyData = await verify.json();
          if (verifyData.success) {
            alert(`✅ ${plan.name} plan active ho gaya! Welcome!`);
            window.location.href = "/dashboard?payment=success";
          } else {
            alert("Payment verify nahi hui. Support se contact karen.");
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => {
        alert(`Payment fail hua: ${r.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch {
      alert("Payment shuru karne mein dikkat aayi.");
      setLoading(null);
    }
  };

  const isActivePlan = subData && subData.plan !== "trial" && subData.subscriptionActive;
  const isCurrent = (planKey: string) => subData?.plan === planKey;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">

      {/* Banner - Active ya Trial */}
      {isActivePlan ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-xl">✅</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Active Subscription — {subData.plan.charAt(0).toUpperCase() + subData.plan.slice(1)} Plan
            </p>
            <p className="text-xs text-gray-500">
              Valid until: {new Date(subData.subscriptionEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">7 Days Free Trial</p>
              <p className="text-xs text-gray-500">Aapka free trial khatam hone wala hai</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CountdownBox value={timeLeft.days} label="Days" />
            <span className="text-gray-300 text-xl font-light mb-3">:</span>
            <CountdownBox value={timeLeft.hours} label="Hours" />
            <span className="text-gray-300 text-xl font-light mb-3">:</span>
            <CountdownBox value={timeLeft.minutes} label="Minutes" />
            <span className="text-gray-300 text-xl font-light mb-3">:</span>
            <CountdownBox value={timeLeft.seconds} label="Seconds" />
          </div>
          <p className="text-xs text-gray-500 text-center md:text-right">Trial khatam hone ke baad account pause ho jayega.</p>
        </div>
      )}

      {/* Header + Toggle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isActivePlan ? "Apna Plan Manage Karen" : "Plan Chunen"}
        </h1>
        <p className="text-gray-500 mt-1">Apne business ke hisab se sahi plan select karen</p>

        <div className="inline-flex items-center gap-1 mt-5 bg-gray-100 rounded-xl p-1.5">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("6month")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${billing === "6month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            6 Mahine
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">1 Free</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {plans.map((plan) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.sixMonthPrice;
          const displayPrice = billing === "monthly" ? plan.monthlyDisplay : plan.sixMonthDisplay;
          const isLoading = loading === plan.planKey;
          const current = isCurrent(plan.planKey);

          return (
            <div
              key={plan.planKey}
              className={`relative rounded-2xl border-2 flex flex-col overflow-hidden transition-all
                ${current ? "border-green-400 ring-2 ring-green-200" : plan.popular ? "border-orange-400 shadow-xl scale-105" : "border-gray-200"}
              `}
            >
              {/* Top badge */}
              {(plan.popular || current) && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className={`text-white text-xs font-semibold px-4 py-1 rounded-full ${current ? "bg-green-500" : "bg-orange-500"}`}>
                    {current ? "✅ Current Plan" : plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`${plan.headerBg} px-6 pt-8 pb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                  <span className="text-2xl">{plan.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">{displayPrice}</span>
                    {billing === "monthly" && <span className="text-gray-400 text-sm">/mahina</span>}
                  </div>
                  {billing === "6month" && (
                    <p className="text-green-600 text-xs font-semibold mt-1">✅ {plan.sixMonthSaving}</p>
                  )}
                  {billing === "monthly" && (
                    <p className="text-gray-400 text-xs mt-1">
                      6 mahine mein <span className="text-green-600 font-medium">{plan.sixMonthSaving.split("(")[0].trim()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="px-6 py-4 bg-white flex-1 flex flex-col">
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${f.included ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {f.included ? "✓" : "✕"}
                      </span>
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !current && handlePayment(plan)}
                  disabled={isLoading || current}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all
                    ${current
                      ? "bg-green-100 text-green-700 cursor-default"
                      : plan.popular
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : plan.planKey === "business"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  {current ? "Active Plan" : isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Processing...
                    </span>
                  ) : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
        <div className="text-2xl mb-2">🎁</div>
        <h3 className="font-bold text-lg">Referral Program</h3>
        <p className="text-orange-100 text-sm mt-1">
          Kisi property owner ko refer karen. Jab woh subscribe karen, aapko <strong className="text-white">1 mahina free</strong> milega!
        </p>
      </div>

    </div>
  );
}
