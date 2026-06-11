import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">About HostOps</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Built for Property Owners,<br />
              Driven by <span className="text-orange-600">Innovation</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              HostOps is a modern property management platform built to simplify your operations, increase efficiency, and maximize revenue.
            </p>
          </div>

          {/* Building illustration with floating icons */}
          <div className="relative flex items-center justify-center" style={{height:"380px"}}>
            <div className="absolute w-72 h-72 bg-orange-50 rounded-full" />
            <div className="relative z-10 text-center">
              <div className="text-9xl leading-none select-none">🏢</div>
              <div className="mt-3 bg-white rounded-xl shadow-lg px-5 py-3 border border-orange-100">
                <p className="text-slate-500 text-xs">Trusted by</p>
                <p className="text-orange-600 text-3xl font-black">500+</p>
                <p className="text-slate-600 text-xs font-medium">Happy Owners</p>
              </div>
            </div>
            <div className="absolute top-8 left-8 bg-white border border-slate-100 rounded-2xl p-3 shadow-md">
              <span className="text-2xl">📅</span>
            </div>
            <div className="absolute top-8 right-8 bg-white border border-slate-100 rounded-2xl p-3 shadow-md">
              <span className="text-2xl">📊</span>
            </div>
            <div className="absolute bottom-12 left-6 bg-white border border-slate-100 rounded-2xl p-3 shadow-md">
              <span className="text-2xl">👥</span>
            </div>
            <div className="absolute bottom-12 right-6 bg-white border border-slate-100 rounded-2xl p-3 shadow-md">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {value:"500+",label:"Happy Owners",icon:"😊"},
            {value:"10K+",label:"Properties Managed",icon:"🏢"},
            {value:"98%",label:"Customer Satisfaction",icon:"⭐"},
            {value:"24/7",label:"Support Available",icon:"🎧"},
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-4xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR STORY — TIMELINE ── */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">Our Journey</p>
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-14">How HostOps Came to Life</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-orange-100 md:left-1/2" />
          <div className="space-y-12">
            {[
              {year:"2022",side:"left",icon:"💡",title:"The Idea",desc:"We saw property owners drowning in spreadsheets, missed bookings, and endless WhatsApp messages. There had to be a better way."},
              {year:"2023",side:"right",icon:"🔨",title:"We Started Building",desc:"A small team of developers and hospitality veterans came together. We talked to 100+ property owners to understand real pain points."},
              {year:"2024",side:"left",icon:"🚀",title:"First Launch",desc:"HostOps went live. Within months, 100+ properties were onboarded. Owners reported saving 3–5 hours every single day."},
              {year:"2025",side:"right",icon:"🤖",title:"HostOps AI",desc:"We launched our AI assistant — auto booking responses, smart reports, revenue predictions. The future of property management is here."},
            ].map((item) => (
              <div key={item.year} className={`relative flex gap-6 md:gap-0 ${item.side === "right" ? "md:flex-row-reverse" : "md:flex-row"}`}>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-600 rounded-full items-center justify-center shadow-lg shadow-orange-200 z-10">
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <div className="flex md:hidden w-12 h-12 bg-orange-600 rounded-full items-center justify-center shadow-lg shadow-orange-200 z-10 flex-shrink-0">
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <div className={`flex-1 md:w-5/12 md:flex-none ${item.side === "right" ? "md:pl-0 md:pr-16" : "md:pl-16 md:pr-0"}`}>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-orange-600 text-xs font-black tracking-widest">{item.year}</span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">What Drives Us</p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {icon:"👥",title:"Customer First",desc:"Every feature we build solves a real problem for real property owners.",bg:"bg-slate-900",text:"text-white",sub:"text-slate-400"},
              {icon:"⚡",title:"Move Fast",desc:"We ship fast, learn from users, and improve continuously.",bg:"bg-orange-600",text:"text-white",sub:"text-orange-100"},
              {icon:"🛡️",title:"Rock Solid",desc:"Reliable systems, 99.9% uptime, enterprise-grade security.",bg:"bg-white border border-slate-200",text:"text-slate-900",sub:"text-slate-500"},
              {icon:"❤️",title:"Transparent",desc:"No hidden fees, no fine print. Honest pricing, honest support.",bg:"bg-white border border-slate-200",text:"text-slate-900",sub:"text-slate-500"},
            ].map((v) => (
              <div key={v.title} className={`${v.bg} rounded-2xl p-6`}>
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className={`font-bold text-lg mb-2 ${v.text}`}>{v.title}</h3>
                <p className={`text-sm leading-relaxed ${v.sub}`}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM NOTE ── */}
      <section className="py-20 max-w-3xl mx-auto px-6 text-center">
        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
          <span className="text-white text-2xl font-black">H</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Built by People Who Get It</h2>
        <p className="text-slate-500 text-lg leading-relaxed mb-6">
          We are a team of developers and hospitality professionals who have lived the chaos of property management. HostOps is the tool we wish we had — and we built it for you.
        </p>
        <p className="text-orange-600 font-semibold text-sm">— Team HostOps, India 🇮🇳</p>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 mx-6 mb-16 rounded-2xl p-10 max-w-7xl md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Let's Grow Your Property Together</h3>
            <p className="text-slate-400 text-sm">Join 500+ property owners across India who run smarter with HostOps.</p>
          </div>
          <div className="text-center shrink-0">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors whitespace-nowrap block shadow-lg shadow-orange-900">
              Start Free — 7 Days Trial
            </Link>
            <p className="text-slate-600 text-xs mt-2">No Credit Card • Cancel Anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
}
