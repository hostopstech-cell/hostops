import Link from "next/link";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">HostOps</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <Link href="/#features" className="hover:text-orange-600 transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-orange-600 transition-colors">Pricing</Link>
          <Link href="/solutions" className="text-orange-600 font-semibold border-b-2 border-orange-600 pb-0.5">Solutions</Link>
          <Link href="/about" className="hover:text-orange-600 transition-colors">About Us</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
          <Link href="/dashboard" className="bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">Solutions Made for Every Property</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              One Platform.<br />
              <span className="text-orange-600">Every</span> Property.
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              HostOps provides powerful, easy-to-use solutions to help you streamline operations, increase bookings, and grow your business effortlessly.
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
          {/* Property Type Cards */}
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl z-10">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <div className="absolute grid grid-cols-2 gap-4 w-full max-w-xs">
              {[
                { icon: "🏨", label: "Hotels", top: "-top-16", left: "-left-8" },
                { icon: "🛏️", label: "Hostels", top: "-top-16", right: "-right-8" },
                { icon: "🏠", label: "Guest Houses", bottom: "-bottom-4", right: "-right-8" },
                { icon: "🏡", label: "Villas & Homestays", bottom: "-bottom-16", left: "left-1/2" },
                { icon: "🏢", label: "Serviced Apartments", bottom: "-bottom-4", left: "-left-8" },
              ].map((p) => (
                <div key={p.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-md">
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <p className="text-xs font-medium text-slate-700">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions for Every Property */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Solutions for Every Type of Property</h2>
            <p className="text-slate-500 text-lg">Whether you manage a single property or multiple locations,<br />HostOps has the right tools to help you succeed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { icon: "🏨", title: "Hotels", color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-100", desc: "Manage front desk, housekeeping, bookings, billing, and guest relationships in one place." },
              { icon: "🛏️", title: "Hostels", color: "bg-blue-50 border-blue-200", iconBg: "bg-blue-100", desc: "Simplify dorm management, bed allocation, and group bookings efficiently." },
              { icon: "🏠", title: "Guest Houses", color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100", desc: "Keep your operations simple and deliver a homely experience to your guests." },
              { icon: "🏢", title: "Serviced Apartments", color: "bg-green-50 border-green-200", iconBg: "bg-green-100", desc: "Manage long stays, maintenance, and guest services with complete ease." },
              { icon: "🏡", title: "Villas & Homestays", color: "bg-yellow-50 border-yellow-200", iconBg: "bg-yellow-100", desc: "Perfect for independent properties looking to automate and grow their bookings." },
            ].map((s) => (
              <div key={s.title} className={`border rounded-2xl p-6 text-center ${s.color}`}>
                <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <Link href="/login" className="text-orange-600 text-sm font-medium hover:underline">Learn More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Powerful Solutions */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Powerful Solutions to Simplify Operations</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "📊", title: "Centralized Dashboard", desc: "Get a complete overview of your properties and performance." },
                { icon: "⚡", title: "Automated Workflows", desc: "Save time with email automation, WhatsApp alerts, and reminders." },
                { icon: "📅", title: "Smart Bookings", desc: "Manage all bookings from multiple channels seamlessly." },
                { icon: "📈", title: "Reports & Analytics", desc: "Make data-driven decisions with real-time insights." },
                { icon: "👥", title: "Guest Management", desc: "Store guest details, history, and preferences securely." },
                { icon: "🔒", title: "Secure & Reliable", desc: "Your data is protected with enterprise-grade security and 99.9% uptime." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{f.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Dashboard Preview */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <span className="text-white text-sm font-semibold">HostOps</span>
            </div>
            <p className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wider">Dashboard Overview</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Total Bookings", value: "128", change: "+12%" },
                { label: "Occupancy Today", value: "76%", change: "+8%" },
                { label: "Today's Revenue", value: "₹24,750", change: "+15%" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <p className="text-white font-bold text-sm mt-1">{s.value}</p>
                  <p className="text-green-400 text-xs">{s.change}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800 rounded-lg p-3 mb-3">
              <p className="text-slate-400 text-xs mb-2">Booking Trend</p>
              <div className="flex items-end gap-1 h-12">
                {[30, 45, 35, 60, 50, 75, 65, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-orange-500 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-2">Recent Bookings</p>
              {["Rahul Sharma", "Priya Singh", "Aman Verma"].map((name) => (
                <div key={name} className="flex justify-between items-center py-1.5 border-b border-slate-700 last:border-0">
                  <p className="text-white text-xs">{name}</p>
                  <span className="text-green-400 text-xs">Confirmed</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HostOps */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Choose HostOps?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { icon: "📦", title: "All-in-One Platform", desc: "Everything you need to run your property business." },
              { icon: "😊", title: "Easy to Use", desc: "Intuitive interface designed for property owners and staff." },
              { icon: "📈", title: "Scalable", desc: "Grow from 1 property to 1000+ with ease." },
              { icon: "🎧", title: "24/7 Support", desc: "We're here to help you, anytime, anywhere." },
              { icon: "👥", title: "Trusted by Owners", desc: "Join 500+ property owners who trust HostOps." },
            ].map((w) => (
              <div key={w.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{w.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-50 border border-orange-100 rounded-2xl mx-6 my-16 p-10 max-w-7xl md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Ready to Simplify Your Property Management?</h3>
              <p className="text-slate-500 text-sm">Join hundreds of property owners who are saving time, increasing bookings, and growing their business with HostOps.</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">
              Start Your Free Trial
            </Link>
            <p className="text-slate-400 text-xs mt-2">7 Days Free Trial • No Credit Card Required</p>
          </div>
        </div>
      </section>

      {/* Footer Logos */}
      <section className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm mb-6">Trusted by 500+ Property Owners Across India</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: "🏰", name: "The Grand Palace", type: "Hotel" },
              { icon: "🏡", name: "Sunshine Villa", type: "Homestay" },
              { icon: "🏨", name: "City Hostel", type: "Hostel" },
              { icon: "🛋️", name: "Comfort Stay", type: "Guest House" },
              { icon: "🏢", name: "Elite Stays", type: "Serviced Apartment" },
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
