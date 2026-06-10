import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">One AI. Every Property.</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              One Platform.<br />
              <span className="text-orange-600">Every</span> Property.
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Whether you run a hotel, hostel, villa, or guest house — HostOps adapts to your property and automates the rest.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
              Get Started Free →
            </Link>
          </div>

          {/* Orbital diagram */}
          <div className="relative flex items-center justify-center" style={{height:"420px"}}>
            {/* Outer dashed ring */}
            <div className="absolute w-80 h-80 rounded-full border-2 border-dashed border-orange-100" />
            {/* Inner ring */}
            <div className="absolute w-52 h-52 rounded-full border border-orange-200/50" />

            {/* Centre */}
            <div className="relative z-10 flex flex-col items-center bg-white rounded-2xl shadow-xl px-5 py-4 border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-orange-200">
                <span className="text-white text-xl font-black">H</span>
              </div>
              <p className="text-slate-900 text-sm font-bold">HostOps</p>
              <p className="text-slate-400 text-xs">One AI. Every Property.</p>
            </div>

            {/* Top — Hotels */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md text-center w-28">
              <div className="text-2xl mb-1">🏨</div>
              <p className="text-slate-700 text-xs font-semibold">Hotels</p>
            </div>

            {/* Top-right — Hostels */}
            <div className="absolute top-12 right-4 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md text-center w-28">
              <div className="text-2xl mb-1">🛏️</div>
              <p className="text-slate-700 text-xs font-semibold">Hostels</p>
            </div>

            {/* Bottom-right — Villas */}
            <div className="absolute bottom-12 right-4 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md text-center w-28">
              <div className="text-2xl mb-1">🏡</div>
              <p className="text-slate-700 text-xs font-semibold">Villas & Homestays</p>
            </div>

            {/* Bottom — Serviced */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md text-center w-32">
              <div className="text-2xl mb-1">🏢</div>
              <p className="text-slate-700 text-xs font-semibold">Serviced Apts</p>
            </div>

            {/* Left — Guest Houses */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md text-center w-28">
              <div className="text-2xl mb-1">🏠</div>
              <p className="text-slate-700 text-xs font-semibold">Guest Houses</p>
            </div>

            {/* Connector dots */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:1}}>
              <circle cx="50%" cy="13%" r="3" fill="#f97316" opacity="0.5" />
              <circle cx="80%" cy="30%" r="3" fill="#f97316" opacity="0.5" />
              <circle cx="80%" cy="70%" r="3" fill="#f97316" opacity="0.5" />
              <circle cx="50%" cy="87%" r="3" fill="#f97316" opacity="0.5" />
              <circle cx="12%" cy="50%" r="3" fill="#f97316" opacity="0.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── PROPERTY TYPES ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">Built for Every Property Type</p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Pick Your Property. We Handle the Rest.</h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">HostOps moulds itself to your property type — same powerful platform, tuned to your workflow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {icon:"🏨",title:"Hotels",color:"bg-orange-50 border-orange-200",points:["Front desk & check-in","Housekeeping tracking","Room tariff management","Billing & invoicing"]},
              {icon:"🛏️",title:"Hostels",color:"bg-blue-50 border-blue-200",points:["Dorm & bed allocation","Group booking management","Shared amenity scheduling","Bed-wise revenue tracking"]},
              {icon:"🏠",title:"Guest Houses",color:"bg-purple-50 border-purple-200",points:["Simple check-in flow","Guest communication","Daily revenue snapshot","Occupancy calendar"]},
              {icon:"🏢",title:"Serviced Apartments",color:"bg-green-50 border-green-200",points:["Long-stay management","Maintenance requests","Monthly billing","Tenant history"]},
              {icon:"🏡",title:"Villas & Homestays",color:"bg-yellow-50 border-yellow-200",points:["OTA channel sync","Guest review tracking","Seasonal pricing","Auto WhatsApp updates"]},
              {icon:"🤖",title:"Any Property + AI",color:"bg-slate-900 border-slate-900",dark:true,points:["Auto booking responses","Smart availability check","Revenue predictions","Zero manual chaos"]},
            ].map((s) => (
              <div key={s.title} className={`border rounded-2xl p-6 ${s.color} ${s.dark ? "text-white" : ""}`}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className={`font-bold text-lg mb-3 ${s.dark ? "text-white" : "text-slate-900"}`}>{s.title}</h3>
                <ul className="space-y-1.5 mb-4">
                  {s.points.map(p => (
                    <li key={p} className={`text-xs flex items-center gap-2 ${s.dark ? "text-slate-300" : "text-slate-600"}`}>
                      <span className="text-orange-500">✓</span>{p}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`text-sm font-semibold hover:underline ${s.dark ? "text-orange-400" : "text-orange-600"}`}>
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">Simple by Design</p>
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Up and Running in Minutes</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {step:"01",icon:"🏠",title:"Add Your Property",desc:"Set up your property, rooms, beds, and amenities in under 5 minutes."},
            {step:"02",icon:"👥",title:"Invite Your Team",desc:"Add staff, assign roles, and control who sees what."},
            {step:"03",icon:"📅",title:"Start Taking Bookings",desc:"Accept bookings from any channel — all land in one place."},
            {step:"04",icon:"🚀",title:"Grow on Autopilot",desc:"Let HostOps AI handle reminders, reports, and revenue tracking."},
          ].map((s) => (
            <div key={s.step} className="relative">
              <div className="text-5xl font-black text-orange-100 mb-2">{s.step}</div>
              <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center mb-3">
                <span className="text-xl">{s.icon}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-orange-50 border border-orange-100 rounded-2xl mx-6 mb-16 p-10 max-w-7xl md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Your Property Type. Our Platform.</h3>
            <p className="text-slate-500 text-sm">Start free — no credit card, no complexity, no chaos.</p>
          </div>
          <div className="text-center shrink-0">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap block shadow-lg shadow-orange-200">
              Start 7 Days Free Trial
            </Link>
            <p className="text-slate-400 text-xs mt-2">No Credit Card • Cancel Anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
}
