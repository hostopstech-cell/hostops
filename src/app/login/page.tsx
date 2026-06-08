"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { name, email, password };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">HostOps</span>
        </Link>
        <p className="hidden sm:block text-sm text-slate-500">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-orange-600 font-semibold hover:underline"
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </nav>

      <div className="grid md:grid-cols-2 min-h-[calc(100vh-65px)]">
        <div className="hidden md:flex flex-col justify-center px-12 py-16 bg-slate-50">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">
            Property Management System
          </p>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
            Welcome <span className="text-orange-600">Back!</span>
          </h1>
          <p className="text-slate-600 mb-10">
            Manage your hotels, hostels, dorms and guesthouses with ease — all from one powerful dashboard.
          </p>
          <div className="space-y-5 mb-10">
            {[
              { icon: "📋", title: "Bookings", desc: "Manage all your bookings in one place" },
              { icon: "👥", title: "Guests", desc: "Track guest details & history" },
              { icon: "📈", title: "Revenue", desc: "Real-time revenue & analytics" },
              { icon: "💬", title: "Automation", desc: "WhatsApp, Email & more" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3">Dashboard Overview</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Total Bookings", value: "128", change: "+12%" },
                { label: "Occupancy", value: "76%", change: "+8%" },
                { label: "Revenue", value: "₹24,750", change: "+15%" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-sm font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-green-600">{s.change}</p>
                </div>
              ))}
            </div>
            {[
              { name: "Rahul Sharma", room: "Dorm A - Bed 3", date: "14 May 2025" },
              { name: "Priya Singh", room: "Private Room 201", date: "14 May 2025" },
              { name: "Aman Verma", room: "Dorm B - Bed 11", date: "14 May 2025" },
            ].map((b) => (
              <div key={b.name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-xs font-medium text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.room} · {b.date}</p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Confirmed</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { value: "500+", label: "Properties" },
              { value: "10K+", label: "Bookings" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "Support" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Trusted by Hotels, Hostels & Guesthouses across India ❤️</p>
        </div>

        <div className="flex items-center justify-center px-6 py-8 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Welcome Back 👋
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Sign in to your HostOps account to continue managing your properties.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Rajesh Kumar"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-9"
                    placeholder="owner@hostel.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-xs text-orange-600 hover:underline">Forgot Password?</button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field pl-9 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-center text-xs text-slate-400">
              🔒 Your data is protected with industry-leading security
            </div>
            <div className="mt-4 text-center text-sm text-slate-600">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-orange-600 font-semibold hover:underline"
              >
                {mode === "login" ? "Register here" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
