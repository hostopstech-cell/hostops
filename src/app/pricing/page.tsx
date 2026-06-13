"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { plans } from "@/lib/pricing-data";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "6month">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);

  const getDisplayPrice = (plan: (typeof plans)[0]) =>
    billing === "monthly" ? plan.monthlyDisplay : plan.sixMonthDisplay;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Orbital Diagram */}
      <div className="pt-24 pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)", backgroundSize: "60px 60px"}}></div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full opacity-5 blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                Simple, Transparent Pricing
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                One Plan for<br/>
                <span className="text-orange-500">Every Property</span>
              </h1>
              <p className="text-slate-400 text-lg mb-8">
                Start free, scale as you grow. No hidden fees, no surprises.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "500+", label: "Active Properties" },
                  { value: "1 Day", label: "Free Trial" },
                  { value: "24/7", label: "Support" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-orange-400">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Orbital diagram */}
            <div className="relative flex items-center justify-center h-72 lg:h-80">
              {/* Center */}
              <div className="absolute z-20 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
                <span className="text-white font-black text-2xl">H</span>
              </div>

              {/* Orbit ring 1 */}
              <div className="absolute w-44 h-44 border border-orange-500/20 rounded-full"></div>
              {/* Orbit ring 2 */}
              <div className="absolute w-72 h-72 border border-orange-500/10 rounded-full"></div>

              {/* Floating feature pills */}
              {[
                { icon: "🏨", label: "Hotels", top: "0%", left: "50%", transform: "translateX(-50%)" },
                { icon: "🛏", label: "Hostels", top: "50%", right: "0%", transform: "translateY(-50%)" },
                { icon: "🏠", label: "Villas", bottom: "0%", left: "50%", transform: "translateX(-50%)" },
                { icon: "🏢", label: "Serviced Apts", top: "50%", left: "0%", transform: "translateY(-50%)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="absolute bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg"
                  style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom, transform: item.transform }}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs text-white font-medium whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="bg-slate-50 border-b border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 gap-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={billing === "monthly" ? "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all bg-slate-900 text-white shadow-sm" : "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:text-slate-700"}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("6month")}
              className={billing === "6month" ? "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-slate-900 text-white shadow-sm" : "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 text-slate-500 hover:text-slate-700"}
            >
              6 Months
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Save 1 Month</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Choose Your Plan</h2>
          <p className="text-slate-500">Click on any plan to see full details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              onClick={() => setSelectedPlan(plan)}
              className={plan.popular ? "relative rounded-2xl border-2 " + plan.color + " overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition-all duration-300 scale-105" : "relative rounded-2xl border-2 " + plan.color + " overflow-hidden shadow-sm cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"}
            >
              {plan.popular && (
                <div className="bg-orange-500 text-white text-xs font-bold text-center py-2 tracking-wide uppercase">
                  ✦ Most Popular
                </div>
              )}
              <div className={plan.headerBg + " px-6 pt-6 pb-4"}>
                <div className="flex items-center justify-between mb-3">
                  <span className={"text-xs font-bold px-3 py-1 rounded-full " + plan.badgeColor}>
                    {plan.badge}
                  </span>
                  <span className="text-3xl">{plan.icon}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">{getDisplayPrice(plan)}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  {billing === "6month" ? (
                    <p className="text-green-600 text-xs font-semibold mt-1">✅ {plan.sixMonthSaving}</p>
                  ) : (
                    <p className="text-slate-400 text-xs mt-1">
                      Save <span className="text-green-600 font-semibold">{plan.sixMonthSaving.split(" savings")[0]}</span> with 6 months
                    </p>
                  )}
                </div>
              </div>
              <div className="px-6 py-5 bg-white">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className={feature.included ? "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-green-100 text-green-600 font-bold" : "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-slate-100 text-slate-400"}>
                        {feature.included ? "✓" : "✕"}
                      </span>
                      <span className={feature.included ? "text-sm text-slate-700" : "text-sm text-slate-400"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Click to view details</span>
                  <span className="text-orange-500 text-sm font-semibold">View Plan →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison band */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white mb-2">Everything Included</h3>
            <p className="text-slate-400 text-sm">All plans come with these core features</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🤖", title: "AI Booking Bot", desc: "24/7 automated guest handling" },
              { icon: "📊", title: "Dashboard", desc: "Real-time property insights" },
              { icon: "💳", title: "Easy Payments", desc: "Razorpay integrated" },
              { icon: "🔒", title: "Secure & Reliable", desc: "99.9% uptime guaranteed" },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  {f.icon}
                </div>
                <div className="text-white font-semibold text-sm">{f.title}</div>
                <div className="text-slate-400 text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Have questions? <a href="mailto:support@hostops.in" className="text-orange-600 font-medium hover:underline">support@hostops.in</a>
          </p>
        </div>
      </div>

      {/* Popup Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={selectedPlan.headerBg + " px-8 pt-8 pb-6 relative"}>
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all text-lg"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedPlan.icon}</span>
                <div>
                  <span className={"text-xs font-bold px-3 py-1 rounded-full " + selectedPlan.badgeColor}>{selectedPlan.badge}</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{selectedPlan.name}</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-4">{selectedPlan.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">{getDisplayPrice(selectedPlan)}</span>
                <span className="text-slate-400">/month</span>
              </div>
              {billing === "6month" ? (
                <p className="text-green-600 text-xs font-semibold mt-2">✅ {selectedPlan.sixMonthSaving}</p>
              ) : (
                <p className="text-slate-400 text-xs mt-2">
                  Save <span className="text-green-600 font-semibold">{selectedPlan.sixMonthSaving.split(" savings")[0]}</span> with 6 months
                </p>
              )}
            </div>

            {/* Modal features */}
            <div className="px-8 py-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What is included</p>
              <ul className="space-y-3 mb-6">
                {selectedPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className={feature.included ? "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs bg-green-100 text-green-600 font-bold" : "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs bg-slate-100 text-slate-400"}>
                      {feature.included ? "✓" : "✕"}
                    </span>
                    <span className={feature.included ? "text-sm text-slate-700 font-medium" : "text-sm text-slate-400"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-slate-600">
                  To subscribe, login to your <span className="font-bold text-orange-600">HostOps Dashboard</span> and go to Subscription.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
