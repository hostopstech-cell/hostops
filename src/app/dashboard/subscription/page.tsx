"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Crown, Sparkles, Phone, Info, Timer } from "lucide-react";

declare global { interface Window { Razorpay: any; } }

const plans = [
  { id: "starter", name: "Starter", subtitle: "Perfect for small properties", icon: Sparkles, monthlyPrice: 999, yearlyPrice: 799, features: ["1 Property","50 Beds","Basic Dashboard","Email Support","Standard Reports"], cta: "Get Started", popular: false, highlight: false },
  { id: "professional", name: "Professional", subtitle: "Best for growing businesses", icon: Zap, monthlyPrice: 2499, yearlyPrice: 1999, features: ["5 Properties","250 Beds","Advanced Dashboard","Priority Support","Custom Reports","WhatsApp Integration","Email Automation"], cta: "Upgrade Now", popular: true, highlight: true },
  { id: "enterprise", name: "Enterprise", subtitle: "For large scale operations", icon: Crown, monthlyPrice: 5999, yearlyPrice: 4799, features: ["Unlimited Properties","Unlimited Beds","White-label Solution","24/7 Phone Support","API Access","Custom Integrations","Dedicated Account Manager","Advanced Analytics"], cta: "Get Started", popular: false, highlight: false },
];

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-gray-900 tabular-nums w-10 text-center">{String(value).padStart(2, "0")}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly");
  const [loading, setLoading] = useState<string|null>(null);
  const [subData, setSubData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetch("/api/subscription").then(r => r.json()).then(setSubData).catch(() => {});
  }, []);

  useEffect(() => {
    if (!subData?.trialEndsAt) return;
    const calc = () => {
      const diff = new Date(subData.trialEndsAt).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000*60*60*24)),
        hours: Math.floor((diff / (1000*60*60)) % 24),
        minutes: Math.floor((diff / (1000*60)) % 60),
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

  const handlePayment = async (planName: string, amount: number) => {
    setLoading(planName);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Razorpay load nahi hua."); setLoading(null); return; }

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt: `hostops_${planName.toLowerCase()}_${Date.now()}`, notes: { plan: planName, billing } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount, currency: data.currency,
        name: "HostOps",
        description: `${planName} Plan - ${billing === "yearly" ? "Yearly" : "Monthly"}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          const verify = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan: planName, billing }),
          });
          const verifyData = await verify.json();
          if (verifyData.success) {
            alert(`✅ Subscription active! Welcome to ${planName} plan.`);
            window.location.href = "/dashboard";
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#f97316" },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { alert(`Payment failed: ${r.error.description}`); setLoading(null); });
      rzp.open();
    } catch (error) {
      alert("Payment shuru karne mein dikkat aayi.");
      setLoading(null);
    }
  };

  const isActivePlan = subData && subData.plan !== "trial" && subData.subscriptionActive;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Trial or Active Banner */}
      {isActivePlan ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">✅</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Active Subscription — {subData.plan.charAt(0).toUpperCase() + subData.plan.slice(1)} Plan</p>
            <p className="text-xs text-gray-500">Valid until: {new Date(subData.subscriptionEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><Timer className="w-5 h-5 text-orange-500" /></div>
            <div><p className="font-semibold text-gray-900 text-sm">7 Days Free Trial</p><p className="text-xs text-gray-500">Your free trial will expire in</p></div>
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
          <p className="text-xs text-gray-500 max-w-xs text-center md:text-right">After the trial ends, your account will be paused.</p>
          <button className="shrink-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">Choose Plan Now</button>
        </div>
      )}

      {!isActivePlan && (
        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-sm text-blue-600">No active plan found. After your trial ends, your account will be paused.</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{isActivePlan ? "Manage Your Plan" : "Choose Your Plan"}</h1>
        <p className="text-gray-500 mt-1">Select the plan that fits your business needs</p>
        <div className="inline-flex items-center gap-2 mt-5 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setBilling("monthly")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Monthly</button>
          <button onClick={() => setBilling("yearly")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Yearly <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Save 20%</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const isLoading = loading === plan.name;
          const isCurrent = subData?.plan === plan.id;
          return (
            <div key={plan.id} className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlight ? "border-orange-400 border-2" : "border-gray-200"} ${isCurrent ? "ring-2 ring-green-400" : ""}`}>
              {plan.popular && !isCurrent && (<div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><span className="bg-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span></div>)}
              {isCurrent && (<div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><span className="bg-green-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Current Plan</span></div>)}
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-orange-500" /></div>
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5 mb-4">{plan.subtitle}</p>
              <div className="mb-6"><span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString("en-IN")}</span><span className="text-gray-400 text-sm">/month</span></div>
              <ul className="space-y-2.5 mb-8 flex-1">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-orange-500 shrink-0" />{f}</li>))}</ul>
              <button
                onClick={() => handlePayment(plan.name, price)}
                disabled={!!isLoading || isCurrent}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${isCurrent ? "bg-green-100 text-green-700 cursor-default" : plan.highlight ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isCurrent ? "Active Plan" : isLoading ? "Processing..." : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-orange-500" /></div>
          <div><h3 className="font-semibold text-gray-900">Need a custom plan?</h3><p className="text-sm text-gray-500">Contact us for enterprise solutions with custom pricing.</p></div>
        </div>
        <button className="shrink-0 px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Contact Sales</button>
      </div>
    </div>
  );
}
