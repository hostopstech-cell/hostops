"use client";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { plans } from "@/lib/pricing-data";

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {q:"What happens after my 7-day free trial?",a:"After your trial ends, you can choose a plan that fits your needs. Your data will be saved and you can continue seamlessly."},
    {q:"Do I need a credit card to start the trial?",a:"No! You can start your 7-day free trial without any credit card. Only when you choose a paid plan will payment be required."},
    {q:"Can I change my plan later?",a:"Yes, you can upgrade or downgrade your plan at any time from your dashboard settings."},
    {q:"Can I cancel my subscription anytime?",a:"Absolutely! You can cancel anytime. No hidden fees, no long-term contracts."},
  ];
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-orange-600 text-sm font-semibold bg-orange-50 px-3 py-1 rounded-full mb-6">🚀 7 DAYS FREE TRIAL</span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">Try HostOps<br /><span className="text-orange-600">Risk-Free</span></h1>
          <p className="text-slate-500 text-lg mb-8">Experience the complete property management platform with full access to all premium features.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[{icon:"💳",title:"No Credit Card",sub:"Required"},{icon:"⏱️",title:"Setup in Under",sub:"5 Minutes"},{icon:"❌",title:"Cancel",sub:"Anytime"},{icon:"⭐",title:"Full Feature",sub:"Access"}].map((f) => (
              <div key={f.title} className="text-center bg-slate-50 rounded-xl p-3"><div className="text-2xl mb-1">{f.icon}</div><p className="text-xs font-semibold text-slate-700">{f.title}</p><p className="text-xs text-slate-400">{f.sub}</p></div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login" className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">Start 7-Day Free Trial →</Link>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">▷ View Live Demo</Link>
          </div>
          <p className="text-slate-400 text-xs mt-3">No credit card required • Cancel anytime • Setup in minutes</p>
        </div>
        <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden hidden md:block">
          <div className="flex">
            <div className="w-36 bg-slate-950 p-3">
              <div className="flex items-center gap-1.5 mb-4"><div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">H</span></div><span className="text-white text-xs font-semibold">HostOps</span></div>
              {["Dashboard","Properties","Rooms & Beds","Bookings","Guests","Revenue","Reports","WhatsApp","Automation","Settings"].map((item) => (<div key={item} className="text-slate-400 text-xs py-1.5 px-2 rounded hover:bg-slate-800 cursor-pointer truncate">{item}</div>))}
            </div>
            <div className="flex-1 p-4">
              <p className="text-slate-400 text-xs font-semibold mb-3">Dashboard Overview</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[{l:"Total Bookings",v:"128",c:"+12%"},{l:"Occupancy Today",v:"76%",c:"+8%"},{l:"Today's Revenue",v:"₹24,750",c:"+15%"}].map((s) => (<div key={s.l} className="bg-slate-800 rounded-lg p-2"><p className="text-slate-400 text-xs">{s.l}</p><p className="text-white font-bold text-sm">{s.v}</p><p className="text-green-400 text-xs">{s.c}</p></div>))}
              </div>
              <div className="bg-slate-800 rounded-lg p-3 mb-2"><p className="text-slate-400 text-xs mb-2">Booking Trend</p><div className="flex items-end gap-1 h-10">{[20,35,25,50,40,65,55,80,70,90].map((h,i) => (<div key={i} className="flex-1 bg-orange-500 rounded-sm" style={{height:`${h}%`}} />))}</div></div>
              <div className="bg-slate-800 rounded-lg p-2"><p className="text-slate-400 text-xs mb-1">Recent Bookings</p>{["Rahul Sharma","Priya Singh"].map(n => (<div key={n} className="flex justify-between py-1 border-b border-slate-700 last:border-0"><p className="text-white text-xs">{n}</p><span className="text-green-400 text-xs bg-green-900 px-1.5 rounded">Confirmed</span></div>))}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-100 py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-400 text-sm mb-6">Trusted by Property Owners Across India</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{icon:"⭐",v:"500+",l:"Properties Onboarded"},{icon:"📅",v:"10,000+",l:"Bookings Managed"},{icon:"👥",v:"98%",l:"Customer Satisfaction"},{icon:"🎧",v:"24/7",l:"Support Available"}].map((s) => (
              <div key={s.l} className="flex items-center gap-3 justify-center"><div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">{s.icon}</div><div className="text-left"><p className="text-xl font-bold text-slate-900">{s.v}</p><p className="text-slate-400 text-xs">{s.l}</p></div></div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-2">Simple & Transparent Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Choose the Plan That<br /><span className="text-orange-600">Fits Your Business</span></h2>
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1 mt-4">
            <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!yearly ? "bg-orange-600 text-white shadow" : "text-slate-500"}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${yearly ? "bg-orange-600 text-white shadow" : "text-slate-500"}`}>Yearly</button>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Save 20%</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`border-2 rounded-2xl p-6 relative flex flex-col ${plan.color} ${plan.popular ? "shadow-xl scale-105" : ""}`}>
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-center mb-4"><p className="text-green-700 text-xs font-semibold">🎁 Includes 7-Day Free Trial</p></div>
              {plan.popular && (<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Most Popular</div>)}
              <div className="text-3xl mb-2">{plan.icon}</div>
              <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
              <div className="mb-1"><span className="text-4xl font-bold text-slate-900">₹{yearly ? plan.yearlyPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}</span><span className="text-slate-400 text-sm">/month</span></div>
              <p className="text-green-600 text-xs mb-4">Billed {yearly ? "yearly" : "monthly"}</p>
              <ul className="space-y-2 mb-8 flex-1">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-slate-600"><span className="text-green-500 font-bold">✓</span> {f}</li>))}</ul>
              <Link href="/login" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.buttonStyle}`}>Start Free Trial</Link>
              <p className="text-center text-slate-400 text-xs mt-2">7 Days Free Trial</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[{icon:"👤",n:"1",title:"Start Free Trial",desc:"Create your account and get instant access to all features."},{icon:"🏨",n:"2",title:"Explore & Manage",desc:"Use HostOps to manage your properties and operations."},{icon:"📋",n:"3",title:"Choose a Plan",desc:"Select the plan that fits your business needs."},{icon:"🚀",n:"4",title:"Continue & Grow",desc:"Continue seamlessly and scale your business."}].map((s) => (
              <div key={s.n} className="text-center"><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">{s.icon}</div><p className="text-orange-600 text-xs font-semibold mb-1">{s.n}.</p><h3 className="font-semibold text-slate-900 text-sm mb-1">{s.title}</h3><p className="text-slate-400 text-xs">{s.desc}</p></div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">No credit card required • Full access to all features • Cancel anytime</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq,i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left"><span className="text-sm font-medium text-slate-900">{faq.q}</span><span className="text-slate-400 text-lg">{openFaq === i ? "−" : "+"}</span></button>
                {openFaq === i && (<div className="px-4 pb-3"><p className="text-slate-500 text-sm">{faq.a}</p></div>)}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 flex flex-col justify-center text-center">
          <span className="text-5xl mb-4">🚀</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Simplify Your Property Management?</h3>
          <p className="text-slate-500 text-sm mb-6">Join hundreds of property owners who trust HostOps to manage their properties efficiently.</p>
          <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">Start Your 7-Day Free Trial</Link>
          <p className="text-slate-400 text-xs mt-3">No Credit Card Required • Cancel Anytime</p>
        </div>
      </section>
    </div>
  );
}
