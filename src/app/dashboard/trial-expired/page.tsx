"use client";
import { useRouter } from "next/navigation";
import { AlertTriangle, Zap, Crown, Sparkles, Check } from "lucide-react";
import { useState } from "react";

declare global { interface Window { Razorpay: any; } }

const plans = [
  { id: "starter", name: "Starter", icon: Sparkles, monthlyPrice: 999, yearlyPrice: 799, features: ["1 Property","50 Beds","Basic Dashboard","Email Support"], highlight: false },
  { id: "professional", name: "Professional", icon: Zap, monthlyPrice: 2499, yearlyPrice: 1999, features: ["5 Properties","250 Beds","Advanced Dashboard","Priority Support","WhatsApp Integration"], highlight: true },
  { id: "enterprise", name: "Enterprise", icon: Crown, monthlyPrice: 5999, yearlyPrice: 4799, features: ["Unlimited Properties","Unlimited Beds","White-label","24/7 Phone Support","API Access"], highlight: false },
];

export default function TrialExpiredPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly");
  const [loading, setLoading] = useState<string|null>(null);

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
        amount: data.amount,
        currency: data.currency,
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
            router.push("/dashboard");
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
      alert("Payment mein dikkat aayi. Dobara try karo.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Free Trial Has Ended</h1>
          <p className="text-gray-500 max-w-md mx-auto">Your 7-day free trial is over. Choose a plan to continue managing your properties and access all your data.</p>
          <div className="inline-flex items-center gap-2 mt-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setBilling("monthly")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${billing === "monthly" ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Monthly</button>
            <button onClick={() => setBilling("yearly")} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Yearly <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Save 20%</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isLoading = loading === plan.name;
            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl border p-6 flex flex-col shadow-sm ${plan.highlight ? "border-orange-400 border-2" : "border-gray-200"}`}>
                {plan.highlight && (<div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><span className="bg-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span></div>)}
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-orange-500" /></div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="my-4"><span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString("en-IN")}</span><span className="text-gray-400 text-sm">/month</span></div>
                <ul className="space-y-2 mb-6 flex-1">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-orange-500 shrink-0" />{f}</li>))}</ul>
                <button
                  onClick={() => handlePayment(plan.name, price)}
                  disabled={!!isLoading}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${plan.highlight ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Processing..." : "Subscribe Now"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-400 text-sm">Your data is safe and will be restored immediately after subscribing.</p>
      </div>
    </div>
  );
}
