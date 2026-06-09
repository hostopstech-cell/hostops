import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">About HostOps</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Built for Property Owners,<br />
              Driven by <span className="text-orange-600">Innovation</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">HostOps is a modern property management system designed to simplify operations, increase efficiency, and help you deliver exceptional guest experiences.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">🏠 Owner Login</Link>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">📊 View Dashboard</Link>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"Total Bookings",value:"128",change:"↑ 12%",color:"text-green-400"},
                {label:"Revenue",value:"₹24,750",change:"↑ 15%",color:"text-green-400"},
                {label:"Occupancy",value:"76%",change:"↑ 8%",color:"text-green-400"},
                {label:"Properties",value:"14",change:"Active",color:"text-orange-400"},
              ].map((s) => (
                <div key={s.label} className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                  <p className={`text-xs mt-1 ${s.color}`}>{s.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-orange-100 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">🏨</div>
                <div className="bg-white rounded-xl px-6 py-3 shadow-md">
                  <p className="text-slate-500 text-sm">Trusted by</p>
                  <p className="text-orange-600 text-3xl font-bold">500+</p>
                  <p className="text-slate-600 text-sm">Property Owners</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">HostOps was born out of a simple idea — property management should be easy, efficient, and accessible for everyone.</p>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">We saw the challenges property owners and managers faced every day, from managing bookings to guest communication and reporting.</p>
              <p className="text-slate-600 text-lg leading-relaxed">So, we built HostOps to bring everything together in one powerful, yet easy-to-use platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {icon:"👥",title:"Customer First",desc:"We focus on our customers' success and build solutions that truly help."},
            {icon:"⚡",title:"Innovative",desc:"We constantly innovate to bring modern, practical features."},
            {icon:"🛡️",title:"Reliable",desc:"We build reliable systems you can count on, every single day."},
            {icon:"❤️",title:"Transparent",desc:"We believe in honesty, clarity, and long-term relationships."},
          ].map((v) => (
            <div key={v.title} className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{v.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wider">Dashboard Overview</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{label:"Total Bookings",value:"128",change:"+12%"},{label:"Occupancy Today",value:"76%",change:"+8%"},{label:"Today's Revenue",value:"₹24,750",change:"+15%"}].map((s) => (
                  <div key={s.label} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">{s.label}</p>
                    <p className="text-white font-bold text-sm mt-1">{s.value}</p>
                    <p className="text-green-400 text-xs">{s.change}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-3">Recent Bookings</p>
                {["Rahul Sharma","Priya Singh","Aman Verma"].map((name) => (
                  <div key={name} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                    <p className="text-white text-xs">{name}</p>
                    <span className="text-green-400 text-xs">Confirmed</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Choose HostOps?</h2>
              {[
                {icon:"✅",title:"All-in-One Platform",desc:"Manage bookings, guests, revenue, and operations seamlessly."},
                {icon:"✅",title:"Easy to Use",desc:"Intuitive interface designed for property owners and staff."},
                {icon:"✅",title:"Powerful Automation",desc:"Automate emails, WhatsApp, reminders, and more."},
                {icon:"✅",title:"Real-time Insights",desc:"Make smarter decisions with real-time analytics and reports."},
              ].map((item) => (
                <div key={item.title} className="flex gap-4 mb-6">
                  <span className="text-orange-600 text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {[
            {icon:"😊",value:"500+",label:"Happy Property Owners"},
            {icon:"📅",value:"10K+",label:"Bookings Managed"},
            {icon:"🏢",value:"500+",label:"Properties Onboarded"},
            {icon:"⭐",value:"98%",label:"Customer Satisfaction"},
            {icon:"🎧",value:"24/7",label:"Support Available"},
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-orange-50 border border-orange-100 rounded-2xl mx-6 mb-16 p-10 max-w-7xl md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Let&apos;s Grow Your Business Together</h3>
              <p className="text-slate-500 text-sm">Join hundreds of property owners who trust HostOps to manage their properties efficiently and grow their business.</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">Get Started Now</Link>
            <p className="text-slate-400 text-xs mt-2">7 Days Free Trial • No Credit Card Required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
