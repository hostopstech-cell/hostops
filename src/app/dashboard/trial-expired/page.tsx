"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertTriangle, Check, ArrowRight, Shield, Zap } from "lucide-react";
import { plans } from "@/lib/pricing-data";

declare global { interface Window { Razorpay: any; } }

export default function TrialExpiredPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "6month">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.owner) setOwnerData(d.owner); }).catch(() => {});
  }, []);

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
      if (!loaded) { alert("Payment gateway failed to load. Please refresh and try again."); setLoading(null); return; }

      const amount = billing === "monthly" ? plan.monthlyPrice : plan.sixMonthPrice;

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt: `hostops_${plan.planKey}_${Date.now()}`, notes: { plan: plan.planKey, billing } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "HostOps",
        description: `${plan.name} Plan — ${billing === "6month" ? "6 Months" : "Monthly"}`,
        order_id: data.orderId,
        prefill: { name: ownerData?.name || "", email: ownerData?.email || "" },
        theme: { color: "#ea580c" },
        handler: async (response: any) => {
          const verify = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan: plan.planKey, billing, amount }),
          });
          const verifyData = await verify.json();
          if (verifyData.success) {
            window.location.href = "/dashboard?payment=success";
          } else {
            alert("Payment verification failed. Please contact support.");
            setLoading(null);
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { alert(`Payment failed: ${r.error.description}`); setLoading(null); });
      rzp.open();
    } catch {
      alert("Could not initiate payment. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-10 pb-16 px-4">
      <div className="max-w-5xl w-full">

        {/* Top Alert */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Free Trial Has Ended</h1>
          <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
            Your 1-day free trial is over. Subscribe to a plan to continue managing your properties — <span className="font-semibold text-slate-700">your data is fully preserved</span> and will be available immediately after subscribing.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-5 flex-wrap justify-center">
            {["No setup fees", "Cancel anytime", "Data always safe", "Instant activation"].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield size={12} className="text-emerald-500" />
                {t}
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-7 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setBilling("monthly")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${billing === "monthly" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("6month")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${billing === "6month" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              6 Months
              <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">1 Free</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.sixMonthPrice;
            const displayPrice = billing === "monthly" ? plan.monthlyDisplay : plan.sixMonthDisplay;
            const isLoading = loading === plan.planKey;
            return (
              <div key={plan.planKey}
                className={`relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all shadow-sm
                  ${plan.popular ? "border-2 border-orange-400 shadow-orange-100 shadow-md" : "border border-slate-200 hover:shadow-md"}`}>

                {plan.popular && (
                  <div className="bg-orange-500 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className={`${plan.headerBg} px-6 pt-5 pb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                    <span className="text-2xl">{plan.icon}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.desc}</p>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{displayPrice}</span>
                      {billing === "monthly" && <span className="text-slate-400 text-sm font-normal">/month</span>}
                    </div>
                    {billing === "6month" ? (
                      <p className="text-emerald-600 text-xs font-semibold mt-1">✅ {plan.sixMonthSaving}</p>
                    ) : (
                      <p className="text-slate-400 text-xs mt-1">
                        Save <span className="text-emerald-600 font-medium">{plan.sixMonthSaving.split("(")[0].trim()}</span> with 6 months
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-white flex-1 flex flex-col">
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold
                          ${f.included ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          {f.included ? "✓" : "✕"}
                        </span>
                        <span className={f.included ? "text-slate-700" : "text-slate-400"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={!!isLoading}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                      ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white" :
                        plan.planKey === "business" ? "bg-purple-600 hover:bg-purple-700 text-white" :
                        "bg-slate-800 hover:bg-slate-900 text-white"}
                      ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}>
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        Subscribe Now
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            🔒 Secured by Razorpay · Your data is preserved and restored instantly after payment
          </p>
        </div>
      </div>
    </div>
  );
}
