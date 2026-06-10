"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.owner) router.replace("/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">Powerful Features</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Everything You Need to<br />Manage <span className="text-orange-600">Smarter</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              HostOps brings together all the tools you need to run your property, automate operations, and grow revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-slate-900 text-white px-7 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                ▶ Watch How It Works
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[420px] select-none">
            <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-orange-200 animate-[spin_20s_linear_infinite]" />
            <div className="absolute w-52 h-52 rounded-full border border-orange-100" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-300 mb-2">
                <span className="text-white text-3xl font-black">H</span>
              </div>
              <p className="text-slate-900 text-sm font-bold">HostOps AI</p>
              <p className="text-slate-400 text-xs">Auto Booking Assistant</p>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-4 py-2 text-center border border-slate-100">
              <p className="text-slate-500 text-xs">Guest Query</p>
              <p className="text-slate-800 text-xs font-semibold">Check availability for tomorrow?</p>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {[{icon:"📅",label:"Booking\nManagement"},{icon:"🛏️",label:"Rooms & Beds\nManagement"},{icon:"👥",label:"Guest\nManagement"}].map((c) => (
                <div key={c.label} className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow flex items-center gap-2 w-36">
                  <span className="text-lg">{c.icon}</span>
                  <p className="text-slate-700 text-xs font-medium leading-tight whitespace-pre-line">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {[{icon:"🤖",label:"HostOps AI\nAssistant",accent:true},{icon:"₹",label:"Revenue\nTracking",accent:false},{icon:"📊",label:"Smart\nReports",accent:false}].map((c) => (
                <div key={c.label} className={`border rounded-xl px-3 py-2 shadow flex items-center gap-2 w-36 ${c.accent?"bg-orange-600 border-orange-600":"bg-white border-slate-100"}`}>
                  <span className={`text-lg ${c.accent?"text-white":""}`}>{c.icon}</span>
                  <p className={`text-xs font-medium leading-tight whitespace-pre-line ${c.accent?"text-white":"text-slate-700"}`}>{c.label}</p>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
              {[{icon:"⚡",label:"Auto Ops"},{icon:"📧",label:"Email Auto"},{icon:"🔔",label:"Smart Alerts"}].map((c) => (
                <div key={c.label} className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow text-center w-24">
                  <span className="text-base">{c.icon}</span>
                  <p className="text-slate-700 text-xs font-medium mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 bg-orange-50 border border-orange-100 rounded-2xl py-4 px-6 text-center">
          <p className="text-orange-700 font-semibold text-sm">🏆 All operations. One platform. Zero chaos.</p>
        </div>
      </section>

      <section className="bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{value:"500+",label:"Happy Owners"},{value:"10K+",label:"Properties Managed"},{value:"98%",label:"Customer Satisfaction"},{value:"24/7",label:"Support Available"}].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">Features That Help You Grow</p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">All-in-One Property Management</h2>
          <p className="text-slate-500 text-center text-lg mb-12 max-w-2xl mx-auto">From automating tasks to real-time insights — save time, reduce chaos, deliver great guest experiences.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {icon:"📅",title:"Bookings Management",desc:"All bookings from every channel in one organised place.",color:"bg-orange-50 border-orange-100"},
              {icon:"👥",title:"Guest Management",desc:"Guest profiles, history, preferences, and documents — secure and searchable.",color:"bg-blue-50 border-blue-100"},
              {icon:"🏢",title:"Property Management",desc:"Multiple properties, rooms, beds, amenities, and tariffs — easily.",color:"bg-green-50 border-green-100"},
              {icon:"💰",title:"Revenue & Collections",desc:"Track collections, expenses, and payments with live reports.",color:"bg-purple-50 border-purple-100"},
              {icon:"📧",title:"Email Automation",desc:"Guest communication on autopilot with smart templates.",color:"bg-yellow-50 border-yellow-100"},
              {icon:"💬",title:"WhatsApp Integration",desc:"Confirmations and reminders directly on WhatsApp.",color:"bg-green-50 border-green-100"},
              {icon:"📊",title:"Reports & Analytics",desc:"Custom reports and visual dashboards to guide decisions.",color:"bg-red-50 border-red-100"},
              {icon:"⚙️",title:"Settings & Config",desc:"Taxes, user roles, policies, and permissions — all in one place.",color:"bg-slate-50 border-slate-200"},
            ].map((f) => (
              <div key={f.title} className={`border ${f.color} rounded-2xl p-6 hover:shadow-md transition-shadow bg-white`}>
                <div className={`w-11 h-11 ${f.color} border rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Why Property Owners Choose HostOps</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {icon:"✅",title:"Easy to Use",desc:"Anyone on your team can run it from day one."},
              {icon:"⚡",title:"Save Time",desc:"Automate repetitive tasks and reduce manual work."},
              {icon:"🔒",title:"Secure & Reliable",desc:"Enterprise-grade security with 99.9% uptime."},
              {icon:"📈",title:"Grow Revenue",desc:"Smarter insights to increase profitability."},
            ].map((w) => (
              <div key={w.title} className="flex gap-3 bg-white border border-slate-200 rounded-2xl p-5">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{w.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-orange-50 border border-orange-100 rounded-2xl mx-6 my-16 p-10 max-w-7xl md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Ready to Experience HostOps?</h3>
            <p className="text-slate-500 text-sm">Join 500+ property owners simplifying operations across India.</p>
          </div>
          <div className="text-center shrink-0">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap block shadow-lg shadow-orange-200">
              Start 7 Days Free Trial
            </Link>
            <p className="text-slate-400 text-xs mt-2">No Credit Card • Cancel Anytime</p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm mb-6">Trusted by 500+ Property Owners Across India</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[{icon:"🏰",name:"The Grand Palace",type:"Hotel"},{icon:"🏡",name:"Sunshine Villa",type:"Homestay"},{icon:"🏨",name:"City Hostel",type:"Hostel"},{icon:"🛋️",name:"Comfort Stay",type:"Guest House"},{icon:"🏢",name:"Elite Stays",type:"Serviced Apartment"}].map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-slate-500">
                <span className="text-xl">{b.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
