"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if(d.owner) router.replace("/dashboard"); }).catch(()=>{});
  }, [router]);
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">Powerful Features</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Everything You Need to<br />
              Manage <span className="text-orange-600">Smarter</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              HostOps brings all the tools you need to manage your properties, guests, bookings, and operations — in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                🏠 Owner Login
              </Link>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                📊 View Dashboard
              </Link>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex">
              <div className="w-32 bg-slate-950 p-3 hidden md:block">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <span className="text-white text-xs font-semibold">HostOps</span>
                </div>
                {["Dashboard","Properties","Rooms & Beds","Bookings","Guests","Revenue","Reports","WhatsApp","Email Auto","Settings"].map((item) => (
                  <div key={item} className="text-slate-400 text-xs py-1.5 px-2 rounded hover:bg-slate-800 cursor-pointer">{item}</div>
                ))}
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-400 text-xs font-semibold mb-3">Dashboard Overview</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[{label:"Total Bookings",value:"128",change:"+12%"},{label:"Occupancy Today",value:"76%",change:"+8%"},{label:"Today's Revenue",value:"₹24,750",change:"+15%"}].map((s) => (
                    <div key={s.label} className="bg-slate-800 rounded-lg p-2">
                      <p className="text-slate-400 text-xs">{s.label}</p>
                      <p className="text-white font-bold text-sm">{s.value}</p>
                      <p className="text-green-400 text-xs">{s.change}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800 rounded-lg p-3 mb-3">
                  <p className="text-slate-400 text-xs mb-2">Booking Trend</p>
                  <div className="flex items-end gap-1 h-10">
                    {[20,35,25,50,40,65,55,80,70,90].map((h,i) => (
                      <div key={i} className="flex-1 bg-orange-500 rounded-sm" style={{height:`${h}%`}} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded-lg p-2">
                    <p className="text-slate-400 text-xs mb-1">Recent Bookings</p>
                    {["Ram Sharma","Priya S.","Aman V."].map(n => (
                      <div key={n} className="flex justify-between py-1 border-b border-slate-700 last:border-0">
                        <p className="text-white text-xs">{n}</p>
                        <span className="text-green-400 text-xs">✓</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2">
                    <p className="text-slate-400 text-xs mb-1">Top Properties</p>
                    {["Grand Inn","City Hostel","Comfort Stay"].map(n => (
                      <div key={n} className="flex justify-between py-1 border-b border-slate-700 last:border-0">
                        <p className="text-white text-xs">{n}</p>
                        <span className="text-orange-400 text-xs">★</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest">Features That Help You Grow</p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">All-in-One Property Management</h2>
          <p className="text-slate-500 text-center text-lg mb-12 max-w-2xl mx-auto">From automating tasks to gaining real-time insights, HostOps helps you save time, increase efficiency, and deliver exceptional guest experiences.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              {icon:"📅",title:"Bookings Management",desc:"Manage all bookings from multiple channels in one place and stay organized.",color:"bg-orange-100"},
              {icon:"👥",title:"Guest Management",desc:"Store guest details, history, preferences, and documents securely.",color:"bg-blue-100"},
              {icon:"🏢",title:"Property Management",desc:"Add and manage multiple properties, rooms, beds, amenities, and tariffs easily.",color:"bg-green-100"},
              {icon:"💰",title:"Revenue & Collections",desc:"Track revenue, collections, expenses, and payments with real-time reports.",color:"bg-purple-100"},
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <Link href="/login" className="text-orange-600 text-sm font-medium hover:underline">Learn More →</Link>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {icon:"📧",title:"Email Automation",desc:"Automate guest communication with customized email templates and triggers.",color:"bg-yellow-100"},
              {icon:"💬",title:"WhatsApp Integration",desc:"Send confirmations, reminders, and updates directly on WhatsApp.",color:"bg-green-100"},
              {icon:"📊",title:"Reports & Analytics",desc:"Get powerful insights with custom reports and data visualizations.",color:"bg-red-100"},
              {icon:"⚙️",title:"Settings & Configuration",desc:"Customize your system, policies, taxes, users, roles, and permissions.",color:"bg-blue-100"},
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <Link href="/login" className="text-orange-600 text-sm font-medium hover:underline">Learn More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Connect & Integrate</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Works Seamlessly with<br />Your <span className="text-orange-600">Favorite Tools</span></h2>
            <p className="text-slate-500 text-lg leading-relaxed">Integrate with leading platforms and services to streamline your operations even further.</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              {name:"Booking.com",bg:"bg-blue-600",text:"B"},
              {name:"Airbnb",bg:"bg-red-500",text:"A"},
              {name:"Google Cal",bg:"bg-blue-400",text:"G"},
              {name:"Razorpay",bg:"bg-indigo-600",text:"R"},
              {name:"& More",bg:"bg-slate-200",text:"···"},
            ].map((t) => (
              <div key={t.name} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <div className={`w-10 h-10 ${t.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white text-sm font-bold">{t.text}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest text-center mb-3">Built for Property Owners</p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Property Owners Love HostOps</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {icon:"✅",title:"Easy to Use",desc:"Intuitive interface that anyone can use with ease."},
              {icon:"⚡",title:"Save Time",desc:"Automate tasks and reduce manual work."},
              {icon:"🔒",title:"Secure & Reliable",desc:"Enterprise-grade security with 99.9% uptime."},
              {icon:"📈",title:"Grow Your Business",desc:"Make smarter decisions and increase profitability."},
            ].map((w) => (
              <div key={w.title} className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-5">
                <span className="text-2xl mt-0.5">{w.icon}</span>
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
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Ready to Experience the Power of HostOps?</h3>
              <p className="text-slate-500 text-sm">Join hundreds of property owners who are simplifying operations and growing their business with HostOps.</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">
              Start 7 Days Free Trial
            </Link>
            <p className="text-slate-400 text-xs mt-2">No Credit Card Required • Cancel Anytime</p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm mb-6">Trusted by 500+ Property Owners Across India</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {icon:"🏰",name:"The Grand Palace",type:"Hotel"},
              {icon:"🏡",name:"Sunshine Villa",type:"Homestay"},
              {icon:"🏨",name:"City Hostel",type:"Hostel"},
              {icon:"🛋️",name:"Comfort Stay",type:"Guest House"},
              {icon:"🏢",name:"Elite Stays",type:"Serviced Apartment"},
            ].map((b) => (
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
