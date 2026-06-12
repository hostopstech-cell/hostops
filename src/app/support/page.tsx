"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 py-14 text-center">
        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Help & Support</p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How can we <span className="text-orange-600">help you?</span></h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">We are here for you — reach out anytime and our team will get back to you quickly.</p>
      </section>
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-slate-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">📧</span></div>
            <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
            <p className="text-slate-500 text-sm mb-4">Send us your query anytime. We reply within 24 hours.</p>
            <a href="mailto:support@hostops.in" className="text-orange-600 font-semibold text-sm hover:underline">support@hostops.in</a>
          </div>
          <div className="border border-slate-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">💬</span></div>
            <h3 className="font-semibold text-slate-900 mb-2">WhatsApp Support</h3>
            <p className="text-slate-500 text-sm mb-4">Chat with us directly on WhatsApp for quick help.</p>
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold text-sm hover:underline">+91 99999 99999</a>
          </div>
          <div className="border border-slate-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⏰</span></div>
            <h3 className="font-semibold text-slate-900 mb-2">Support Hours</h3>
            <p className="text-slate-500 text-sm mb-4">Our team is available 6 days a week to assist you.</p>
            <p className="text-slate-700 font-semibold text-sm">Mon-Sat, 10 AM - 7 PM</p>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {q:"How do I get started with HostOps?",a:"Simply click Start Free Trial, create your account, and add your first property. No credit card required."},
              {q:"Can I manage multiple properties?",a:"Yes! HostOps supports unlimited properties under one account. Switch between them from your dashboard."},
              {q:"Is my data secure?",a:"Absolutely. We use enterprise-grade encryption and secure cloud infrastructure to protect all your data."},
              {q:"What payment methods are supported?",a:"We support all major UPI apps, credit/debit cards, and net banking via Razorpay — fully secure."},
              {q:"Can I cancel my subscription anytime?",a:"Yes, you can cancel anytime from your dashboard. No hidden fees or lock-in periods."},
              {q:"Do you offer onboarding help?",a:"Yes! Our team will help you set up your property, rooms, and settings. Just reach out via email or WhatsApp."},
            ].map((item,i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">❓ {item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-orange-600/30">💼 Partner Program</div>
              <h2 className="text-3xl font-bold text-white mb-4">Earn by Referring Property Owners</h2>
              <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto leading-relaxed">Join the HostOps Partner Program. Refer hotels, hostels, and guest houses — earn commission on every successful onboarding. No investment required.</p>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[{icon:"🔗",label:"Get Your Code",desc:"Unique referral code for you"},{icon:"📤",label:"Share & Refer",desc:"Share with property owners"},{icon:"💰",label:"Earn Commission",desc:"Get paid on every signup"}].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <p className="text-white font-semibold text-sm">{s.label}</p>
                    <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/partner" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/30">Become a Partner →</Link>
              <p className="text-slate-500 text-xs mt-3">Free to join • No investment required</p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-slate-100 py-8 text-center">
        <p className="text-slate-400 text-sm">Still have questions? Email us at <a href="mailto:support@hostops.in" className="text-orange-600 hover:underline">support@hostops.in</a></p>
      </section>
    </div>
  );
}
