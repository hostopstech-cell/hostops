import Link from "next/link";

export default function Home() {
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
          <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-orange-600 transition-colors">Pricing</a>
          <a href="/solutions" className="hover:text-orange-600 transition-colors">Solutions</a>
          <a href="/about" className="hover:text-orange-600 transition-colors">About Us</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link href="/dashboard" className="bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">
              Property Management System
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Smart Management <br />
              for <span className="text-orange-600">Modern Stays</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Manage bookings, guests, and operations for hotels, hostels,
              dorms, and guesthouses across India — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                🏠 Owner Login
              </Link>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                📊 View Dashboard
              </Link>
            </div>

            {/* Features Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
              {[
                { icon: "📋", title: "Bookings", desc: "Manage all bookings in one place" },
                { icon: "👥", title: "Guests", desc: "Track guest details & history" },
                { icon: "📈", title: "Revenue", desc: "Real-time revenue & analytics" },
                { icon: "⚡", title: "Automation", desc: "WhatsApp, Email & more" },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="hidden md:block">
            <div className="bg-slate-50 rounded-2xl p-4 shadow-2xl border border-slate-200">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 mb-3">Dashboard Overview</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total Bookings", value: "128", change: "+12%" },
                    { label: "Occupancy Today", value: "76%", change: "+8%" },
                    { label: "Today's Revenue", value: "₹24,750", change: "+15%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-lg font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-green-600">{s.change}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Recent Bookings</p>
                {[
                  { name: "Rahul Sharma", room: "Dorm A - Bed 3", date: "14 May 2025", status: "Confirmed" },
                  { name: "Priya Singh", room: "Private Room 201", date: "14 May 2025", status: "Confirmed" },
                  { name: "Aman Verma", room: "Dorm B - Bed 11", date: "14 May 2025", status: "Confirmed" },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.room} · {b.date}</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-orange-400", "bg-blue-400", "bg-green-400"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white`} />
                ))}
              </div>
              <p className="text-sm text-slate-600">Trusted by <span className="font-bold text-slate-900">500+</span> property owners</p>
            </div>
            {[
              { value: "10K+", label: "Bookings Managed" },
              { value: "500+", label: "Properties Onboarded" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "24/7", label: "Support Available" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
