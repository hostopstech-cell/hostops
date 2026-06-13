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
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<typeof plans[0] | null>(null);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    if (ownerData?.email) setVerifyEmail(ownerData.email);
  }, [ownerData]);

  async function sendOtp() {
    setVerifyError(""); setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error || "Failed to send OTP"); setVerifyLoading(false); return; }
      setOtpSent(true);
    } catch { setVerifyError("Something went wrong. Please try again."); }
    setVerifyLoading(false);
  }

  async function verifyOtp() {
    setVerifyError(""); setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error || "Verification failed"); setVerifyLoading(false); return; }
      setOwnerData((prev: any) => ({ ...prev, email: verifyEmail, emailVerified: true }));
      setShowVerifyModal(false);
      setOtpSent(false); setOtpValue("");
      if (pendingPlan) { handlePayment(pendingPlan); setPendingPlan(null); }
    } catch { setVerifyError("Something went wrong. Please try again."); }
    setVerifyLoading(false);
  }

  function startSubscribe(plan: typeof plans[0]) {
    if (!ownerData?.emailVerified) {
      setPendingPlan(plan);
      setShowVerifyModal(true);
      setOtpSent(false); setOtpValue(""); setVerifyError("");
      return;
    }
    handlePayment(plan);
  }

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
      if (!loaded) { alert("Razorpay failed to load."); setLoading(null); return; }

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
        description: `${plan.name} Plan - ${billing === "6month" ? "6 Months" : "1 Month"}`,
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
            alert(`✅ ${plan.name} plan activated successfully!`);
            window.location.href = "/dashboard?payment=success";
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { alert(`Payment failed: ${r.error.description}`); setLoading(null); });
      rzp.open();
    } catch {
      alert("Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  const isActivePlan = subData && subData.plan !== "trial" && subData.subscriptionActive;
  const isCurrent = (planKey: string) => subData?.plan === planKey;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">

      {/* Banner */}
      {isActivePlan ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-xl">✅</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Active Subscription — {subData.plan.charAt(0).toUpperCase() + subData.plan.slice(1)} Plan</p>
            <p className="text-xs text-gray-500">Valid until: {new Date(subData.subscriptionEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
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
              <p className="text-xs text-gray-500">Your free trial is ending soon</p>
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
          <p className="text-xs text-gray-500 text-center md:text-right">After trial ends, your account will be paused.</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{isActivePlan ? "Manage Your Plan" : "Choose Your Plan"}</h1>
        <p className="text-gray-500 mt-1">Select the plan that fits your business needs</p>
        <div className="inline-flex items-center gap-1 mt-5 bg-gray-100 rounded-xl p-1.5">
          <button onClick={() => setBilling("monthly")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Monthly</button>
          <button onClick={() => setBilling("6month")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${billing === "6month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            6 Months <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">1 Free</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {plans.map((plan) => {
          const displayPrice = billing === "monthly" ? plan.monthlyDisplay : plan.sixMonthDisplay;
          const isLoading = loading === plan.planKey;
          const current = isCurrent(plan.planKey);

          return (
            <div
              key={plan.planKey}
              className={`relative rounded-2xl flex flex-col overflow-hidden transition-all
                ${current
                  ? "border-2 border-green-400 shadow-lg ring-4 ring-green-100"
                  : "border border-gray-200 shadow-sm hover:shadow-md"
                }
              `}
            >
              {/* Current Plan Tag - only for current plan */}
              {current && (
                <div className="bg-green-500 text-white text-xs font-semibold text-center py-1.5">
                  ✅ Current Plan
                </div>
              )}

              {/* Header */}
              <div className={`${plan.headerBg} px-6 pt-5 pb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                  <span className="text-2xl">{plan.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">{displayPrice}</span>
                    {billing === "monthly" && <span className="text-gray-400 text-sm">/month</span>}
                  </div>
                  {billing === "6month" && (
                    <p className="text-green-600 text-xs font-semibold mt-1">✅ {plan.sixMonthSaving}</p>
                  )}
                  {billing === "monthly" && (
                    <p className="text-gray-400 text-xs mt-1">
                      Save <span className="text-green-600 font-medium">{plan.sixMonthSaving.split("(")[0].trim()}</span> with 6 months
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
                  onClick={() => !current && startSubscribe(plan)}
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
          Refer a property owner. When they subscribe, you get <strong className="text-white">1 month free!</strong>
        </p>
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Verify Your Email</h3>
            <p className="text-sm text-slate-500 mb-4">Please verify your email address before subscribing so we can keep you updated about your plan.</p>

            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <input
              value={verifyEmail}
              onChange={e => { setVerifyEmail(e.target.value); setOtpSent(false); setOtpValue(""); setVerifyError(""); }}
              disabled={otpSent}
              className="input-field w-full text-sm text-slate-900 mb-3 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="you@example.com"
            />

            {otpSent && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Enter OTP</label>
                <input
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="input-field w-full text-sm text-slate-900 font-mono tracking-widest text-center"
                  placeholder="6-digit code"
                />
                <p className="text-xs text-slate-400 mt-1">We sent a code to {verifyEmail}. It expires in 10 minutes.</p>
              </div>
            )}

            {verifyError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg mb-3">{verifyError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowVerifyModal(false); setPendingPlan(null); }}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  disabled={verifyLoading || !verifyEmail}
                  className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {verifyLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <button
                  onClick={verifyOtp}
                  disabled={verifyLoading || otpValue.length !== 6}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {verifyLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              )}
            </div>

            {otpSent && (
              <button onClick={() => { setOtpValue(""); setVerifyError(""); sendOtp(); }} disabled={verifyLoading} className="text-xs text-orange-600 mt-3 hover:underline">
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
