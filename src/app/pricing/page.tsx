"use client";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import { plans } from "@/lib/pricing-data";

declare global { interface Window { Razorpay: any; } }

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{name:string;amount:number}|null>(null);

  const faqs = [
    {q:"What happens after my 7-day free trial?",a:"After your trial ends, choose a plan that fits. Your data is saved and you continue seamlessly."},
    {q:"Do I need a credit card to start?",a:"No! Start your 7-day free trial without any credit card. Payment only when you pick a paid plan."},
    {q:"Can I change my plan later?",a:"Yes, upgrade or downgrade anytime from your dashboard settings."},
    {q:"Can I cancel anytime?",a:"Absolutely. No hidden fees, no long-term contracts. Cancel in one click."},
  ];

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const openRazorpay = async (planName: string, amount: number, ownerData: any) => {
    const loaded = await loadRazorpay();
    if (!loaded) { alert("Razorpay load nahi hua."); return; }

    const res = await fetch("/api/razorpay/create-order", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, receipt: `hostops_${planName.toLowerCase()}_${Date.now()}`, notes: { plan: planName, billing: yearly ? "yearly" : "monthly" } }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: data.amount, currency: data.currency,
      name: "HostOps", description: `${planName} Plan`, order_id: data.orderId,
      prefill: { name: ownerData?.name || "", email: ownerData?.email || "", contact: ownerData?.phone || "" },
      handler: async (response: any) => {
        const verify = await fetch("/api/razorpay/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
        const verifyData = await verify.json();
        if (verifyData.success) { alert("✅ Payment successful! Welcome to HostOps."); window.location.href = "/dashboard"; }
        else alert("❌ Payment verification failed.");
      },
      theme: { color: "#ea580c" }, modal: { ondismiss: () => setLoading(null) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r: any) => { alert(`Payment failed: ${r.error.description}`); setLoading(null); });
    rzp.open();
  };

  const handlePayment = async (planName: string, amount: number) => {
    setLoading(planName);
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData?.owner) {
        // Login nahi hai — modal kholo, plan save karo
        setPendingPlan({ name: planName, amount });
        setShowLogin(true);
        setLoading(null);
        return;
      }

      await openRazorpay(planName, amount, authData.owner);
    } catch (e) {
      alert("Kuch gadbad ho gayi. Dobara try karo.");
    } finally {
      setLoading(null);
    }
  };

  // Login modal band hone ke baad — agar pending plan hai toh proceed karo
  const handleLoginClose = async () => {
    setShowLogin(false);
    if (pendingPlan) {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (authData?.owner) {
        const { name, amount } = pendingPlan;
        setPendingPlan(null);
        setLoading(name);
        try { await openRazorpay(name, amount, authData.owner); }
        catch (e) { alert("Kuch gadbad ho gayi."); }
        finally { setLoading(null); }
      } else {
        setPendingPlan(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🎁 7-Day Free Trial — No Credit Card Needed
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-4">
          One price.<br />
          <span className="text-orange-600">Zero surprises.</span>
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
          Everything you need to run your property — bookings, guests, revenue, WhatsApp — in one simple plan.
        </p>
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1 mb-4">
          <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!yearly ? "bg-white text-slate-900 shadow" : "text-slate-400"}`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${yearly ? "bg-white text-slate-900 shadow" : "text-slate-400"}`}>Yearly</button>
        </div>
        {yearly && (
          <div className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
            🎉 Save 20%
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isLoading = loading === plan.name;
            return (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col border-2 transition-all ${
                plan.popular ? "bg-slate-900 border-slate-900 text-white scale-105 shadow-2xl" : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-md"
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-4 py-1 rounded-full font-bold whitespace-nowrap">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h2 className={`text-xl font-bold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h2>
                <p className="text-sm mb-5 text-slate-400">{plan.desc}</p>
                <div className="mb-1">
                  <span className={`text-4xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>₹{price.toLocaleString()}</span>
                  <span className="text-sm ml-1 text-slate-400">/mo</span>
                </div>
                {yearly && <p className="text-green-400 text-xs mb-4">Billed yearly · 20% saved</p>}
                {!yearly && <p className={`text-xs mb-4 ${plan.popular ? "text-slate-500" : "text-slate-400"}`}>Billed monthly</p>}
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                      <span className="text-orange-500 mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(plan.name, price)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.popular ? "bg-orange-500 text-white hover:bg-orange-400" : "bg-slate-900 text-white hover:bg-slate-800"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Please wait..." : "Start Free Trial"}
                </button>
                <p className={`text-center text-xs mt-2 ${plan.popular ? "text-slate-500" : "text-slate-400"}`}>
                  7 days free · no card needed
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-orange-50 border border-orange-100 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            {icon:"🔒",label:"Secure Payments",sub:"via Razorpay"},
            {icon:"⚡",label:"Instant Setup",sub:"Under 5 minutes"},
            {icon:"🔄",label:"Cancel Anytime",sub:"No lock-in"},
            {icon:"🎧",label:"24/7 Support",sub:"Always available"},
          ].map((f) => (
            <div key={f.label}>
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-slate-800 text-sm font-semibold">{f.label}</p>
              <p className="text-slate-400 text-xs">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">From Sign-up to Running in 4 Steps</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {n:"01",icon:"👤",title:"Sign Up Free",desc:"No card. Instant access to everything."},
              {n:"02",icon:"🏨",title:"Set Up Property",desc:"Add rooms, tariffs, and team in minutes."},
              {n:"03",icon:"📅",title:"Take Bookings",desc:"Go live and start accepting bookings."},
              {n:"04",icon:"🚀",title:"Pick a Plan",desc:"Choose when you're ready. We'll remind you."},
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="text-6xl font-black text-orange-50 mb-1 leading-none">{s.n}</div>
                <div className="w-10 h-10 bg-white border border-orange-200 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Got Questions?</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                  <span className="text-slate-400 font-bold text-lg ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-4"><p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-8 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-900">
            <span className="text-white text-2xl font-black">H</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Start Today. Decide Later.</h3>
          <p className="text-slate-400 text-sm mb-6">7 days full access. No card. No catch. Just your property, running smarter.</p>
          <button onClick={() => setShowLogin(true)} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900">
            Start Free — No Card Needed
          </button>
          <p className="text-slate-600 text-xs mt-3">500+ property owners already on HostOps</p>
        </div>
      </section>

      {showLogin && <LoginModal onClose={handleLoginClose} />}
    </div>
  );
}
