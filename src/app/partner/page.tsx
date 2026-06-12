"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PartnerPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"landing" | "register" | "login">("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Register form
  const [regForm, setRegForm] = useState({
    name: "", email: "", phone: "", password: "",
    upi_id: "", bank_holder_name: "", bank_account: "", bank_ifsc: "", bank_name: ""
  });

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    fetch("/api/partner/me").then(r => r.json()).then(d => {
      if (d.agent) router.push("/partner/dashboard");
      else setCheckingAuth(false);
    }).catch(() => setCheckingAuth(false));
  }, [router]);

  async function handleRegister() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/partner/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push("/partner/dashboard");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }

  async function handleLogin() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/partner/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      router.push("/partner/dashboard");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }

  if (checkingAuth) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {mode === "landing" && (
        <div className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl" />
          </div>

          {/* Hero */}
          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">Partner Program • Earn with HostOps</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Refer Hotels.<br />
              <span className="text-orange-500">Earn Commission.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Join HostOps Partner Program. Help property owners grow their business and earn a commission on every successful onboarding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button onClick={() => setMode("register")}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40">
                Become a Partner →
              </button>
              <button onClick={() => setMode("login")}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-semibold text-lg transition-all">
                Partner Login
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20">
              {[
                { label: "Commission Earned", value: "Per Sale", icon: "₹" },
                { label: "Payment Method", value: "UPI / Bank", icon: "🏦" },
                { label: "Payout Time", value: "Within 24hrs", icon: "⚡" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-slate-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "01", title: "Register", desc: "Sign up as a HostOps partner and get your unique referral code instantly." },
                  { step: "02", title: "Add Lead", desc: "Enter your prospect's email to reserve them under your account." },
                  { step: "03", title: "They Join", desc: "When they register and purchase a plan, you get commission." },
                  { step: "04", title: "Get Paid", desc: "Receive payment via UPI or bank transfer within 24 hours." },
                ].map((s, i) => (
                  <div key={i} className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left">
                    <div className="text-4xl font-black text-orange-500/30 mb-3">{s.step}</div>
                    <div className="font-semibold text-white mb-2">{s.title}</div>
                    <div className="text-slate-400 text-sm">{s.desc}</div>
                    {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 text-orange-500 text-xl">›</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Form */}
      {mode === "register" && (
        <div className="max-w-2xl mx-auto px-6 py-20">
          <button onClick={() => { setMode("landing"); setError(""); }}
            className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
            ← Back
          </button>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-2">Join as Partner</h2>
            <p className="text-slate-400 mb-8">Fill in your details to get started</p>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">{error}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
                  <input value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Rahul Sharma" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Phone *</label>
                  <input value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})}
                    placeholder="9876543210" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                  placeholder="rahul@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Password *</label>
                <input type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}
                  placeholder="Min 6 characters" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <p className="text-sm text-slate-400 mb-4">Payment Details <span className="text-slate-600">(optional — add later)</span></p>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">UPI ID</label>
                  <input value={regForm.upi_id} onChange={e => setRegForm({...regForm, upi_id: e.target.value})}
                    placeholder="rahul@upi" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Account Holder Name</label>
                    <input value={regForm.bank_holder_name} onChange={e => setRegForm({...regForm, bank_holder_name: e.target.value})}
                      placeholder="Rahul Sharma" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Bank Name</label>
                    <input value={regForm.bank_name} onChange={e => setRegForm({...regForm, bank_name: e.target.value})}
                      placeholder="SBI / HDFC etc." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Account Number</label>
                    <input value={regForm.bank_account} onChange={e => setRegForm({...regForm, bank_account: e.target.value})}
                      placeholder="1234567890" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">IFSC Code</label>
                    <input value={regForm.bank_ifsc} onChange={e => setRegForm({...regForm, bank_ifsc: e.target.value})}
                      placeholder="SBIN0001234" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                </div>
              </div>

              <button onClick={handleRegister} disabled={loading || !regForm.name || !regForm.email || !regForm.phone || !regForm.password}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all">
                {loading ? "Creating Account..." : "Create Partner Account →"}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Already a partner?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-orange-400 hover:text-orange-300">Sign in</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      {mode === "login" && (
        <div className="max-w-md mx-auto px-6 py-20">
          <button onClick={() => { setMode("landing"); setError(""); }}
            className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
            ← Back
          </button>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-2">Partner Login</h2>
            <p className="text-slate-400 mb-8">Welcome back</p>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email</label>
                <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="rahul@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Password</label>
                <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="Your password" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <button onClick={handleLogin} disabled={loading || !loginForm.email || !loginForm.password}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all">
                {loading ? "Signing in..." : "Sign In →"}
              </button>
              <p className="text-center text-slate-400 text-sm">
                New partner?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-orange-400 hover:text-orange-300">Register here</button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
