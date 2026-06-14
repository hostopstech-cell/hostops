"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const PLANS = [
  {
    key: "starter", icon: "⚡", name: "Starter",
    badge: "For Beginners", badgeColor: "bg-slate-100 text-slate-600",
    desc: "Perfect for small guesthouses & boutique stays",
    highlight: "border-slate-200", headerBg: "from-slate-50 to-white",
    btnClass: "bg-slate-900 hover:bg-slate-800 text-white",
    popular: false,
    features: [
      { text: "1 Property", icon: "🏠" },
      { text: "AI Booking Bot", icon: "🤖" },
      { text: "1 Staff Account", icon: "👤" },
      { text: "Basic Dashboard", icon: "📊" },
      { text: "Email Support", icon: "📧" },
    ],
    locked: [
      { text: "Revenue Reports" },
      { text: "WhatsApp Integration" },
      { text: "Priority Support" },
    ],
  },
  {
    key: "growth", icon: "🚀", name: "Growth",
    badge: "Most Popular", badgeColor: "bg-orange-500 text-white",
    desc: "Built for hotels & hostels scaling up fast",
    highlight: "border-orange-400", headerBg: "from-orange-50 to-white",
    btnClass: "bg-orange-600 hover:bg-orange-700 text-white",
    popular: true,
    features: [
      { text: "5 Properties", icon: "🏨" },
      { text: "AI Booking Bot", icon: "🤖" },
      { text: "3 Staff Accounts", icon: "👥" },
      { text: "Advanced Dashboard", icon: "📈" },
      { text: "Revenue Reports", icon: "💰" },
      { text: "WhatsApp Integration", icon: "💬" },
      { text: "Priority Support", icon: "⚡" },
      { text: "Email Automation", icon: "📬" },
    ],
    locked: [],
  },
  {
    key: "business", icon: "👑", name: "Business",
    badge: "Best Value", badgeColor: "bg-purple-600 text-white",
    desc: "For chains, villas & large-scale operations",
    highlight: "border-purple-400", headerBg: "from-purple-50 to-white",
    btnClass: "bg-purple-700 hover:bg-purple-800 text-white",
    popular: false,
    features: [
      { text: "Unlimited Properties", icon: "♾️" },
      { text: "AI Booking Bot", icon: "🤖" },
      { text: "Unlimited Staff", icon: "👨‍👩‍👧‍👦" },
      { text: "Full Dashboard Suite", icon: "🎛️" },
      { text: "Revenue Reports", icon: "💰" },
      { text: "WhatsApp Integration", icon: "💬" },
      { text: "24/7 Priority Support", icon: "🛡️" },
      { text: "Custom Integrations", icon: "🔧" },
    ],
    locked: [],
  },
];

const COUNTRIES = [
  { flag: "🇮🇳", name: "India" },
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇦🇪", name: "UAE" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇶🇦", name: "Qatar" },
  { flag: "🇸🇦", name: "KSA" },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(#ea580c 1px,transparent 1px),linear-gradient(90deg,#ea580c 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute top-16 left-1/4 w-72 h-72 bg-orange-500 rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400 rounded-full opacity-[0.04] blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            No credit card required · 7-day free trial
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-[1.1] tracking-tight">
            Property management<br />
            <span className="text-orange-500">that pays for itself</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Plans crafted for every scale — from a single guesthouse to a chain of hotels.
            <span className="text-slate-300 font-medium"> Sign up to see pricing in your currency.</span>
          </p>

          {/* Country flags strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {COUNTRIES.map(c => (
              <div key={c.name} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <span className="text-lg">{c.flag}</span>
                <span className="text-xs text-slate-400 font-medium">{c.name}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { v: "500+", l: "Properties Live" },
              { v: "7 Days", l: "Free Trial" },
              { v: "10+", l: "Countries" },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black text-orange-400">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON STRIP ─────────────────────────── */}
      <section className="bg-orange-600 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white text-sm font-medium">
            <span>✦ Others charge $200+/month</span>
            <span className="hidden sm:block opacity-40">|</span>
            <span>✦ No hidden fees ever</span>
            <span className="hidden sm:block opacity-40">|</span>
            <span>✦ Cancel anytime</span>
            <span className="hidden sm:block opacity-40">|</span>
            <span>✦ 1 month free on 6-month plans</span>
          </div>
        </div>
      </section>

      {/* ── PLAN CARDS ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Choose your plan
          </h2>
          <p className="text-slate-500 text-base">
            Pricing adjusts to your country after you sign up — always fair, always local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.key}
              className={`relative rounded-3xl border-2 ${plan.highlight} overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? "shadow-xl -translate-y-1" : "shadow-sm"}`}>

              {plan.popular && (
                <div className="bg-orange-500 text-white text-xs font-bold text-center py-2 tracking-widest uppercase">
                  ✦ Most Popular
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-b ${plan.headerBg} px-6 pt-6 pb-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                  <span className="text-3xl">{plan.icon}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.desc}</p>

                {/* Price CTA area */}
                <div className="mt-5 bg-slate-900 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Pricing unlocks after signup</p>
                    <p className="text-sm font-bold text-orange-400">Local currency · No surprises</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-orange-400 text-sm">🔓</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="px-6 py-5 bg-white">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What you get</p>
                <ul className="space-y-2.5 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                      <span className="text-sm text-slate-700 flex items-center gap-1.5">
                        <span>{f.icon}</span> {f.text}
                      </span>
                    </li>
                  ))}
                  {plan.locked.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 opacity-40">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs text-slate-400">✕</span>
                      <span className="text-sm text-slate-400">{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push("/login")}
                  className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${plan.btnClass} shadow-sm`}>
                  Get Started Free →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-white mb-1">Every plan includes</h3>
            <p className="text-slate-400 text-sm">No feature-gating on the basics. Ever.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🤖", t: "AI Booking Bot", d: "24/7 automated guest handling" },
              { icon: "📊", t: "Live Dashboard", d: "Real-time property insights" },
              { icon: "💳", t: "Easy Payments", d: "Razorpay integrated" },
              { icon: "🔒", t: "99.9% Uptime", d: "Reliable & always on" },
              { icon: "📱", t: "Mobile Ready", d: "Manage from anywhere" },
              { icon: "🌍", t: "Multi-currency", d: "Auto-detected for you" },
              { icon: "🎁", t: "7-Day Trial", d: "No card needed to start" },
              { icon: "🛡️", t: "Secure Data", d: "Bank-grade encryption" },
            ].map(f => (
              <div key={f.t} className="text-center">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-xl mx-auto mb-2">
                  {f.icon}
                </div>
                <div className="text-white font-semibold text-xs mb-0.5">{f.t}</div>
                <div className="text-slate-400 text-xs">{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / CTA */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm mb-1">Still have questions?</p>
          <a href="mailto:support@hostops.in" className="text-orange-600 font-semibold hover:underline text-sm">
            support@hostops.in
          </a>
        </div>
      </section>
    </div>
  );
}
