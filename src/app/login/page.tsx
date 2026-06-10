"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(data=>{
      if(data.owner) router.replace("/dashboard");
      else setChecking(false);
    }).catch(()=>setChecking(false));
    const errorParam = searchParams.get("error");
    if(errorParam==="not_registered") setError("Aapka Google account registered nahi hai. Pehle Register karein.");
  }, [searchParams, router]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true); setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const endpoint = mode==="login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode==="login" ? {email,password} : {name,email,password};
    try {
      const res = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await res.json();
      if(!res.ok){setError(data.error||"Something went wrong");return;}
      router.push("/dashboard"); router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  if(checking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-900">
          <span className="text-white font-black text-lg">H</span>
        </div>
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] flex">

      {/* ── LEFT — Dark creative panel ── */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-900 px-12 py-10">
        {/* Top logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900">
            <span className="text-white font-black">H</span>
          </div>
          <span className="text-white font-bold text-lg">HostOps</span>
        </Link>

        {/* Centre content */}
        <div>
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-4">Your Property Command Centre</p>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Run your property<br />like a <span className="text-orange-500">pro.</span>
          </h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed">
            Bookings, guests, revenue, WhatsApp — everything in one place. 500+ property owners across India already trust HostOps.
          </p>

          {/* Feature list */}
          <div className="space-y-4 mb-10">
            {[
              {icon:"📅", title:"Smart Bookings", desc:"All channels. One dashboard."},
              {icon:"👥", title:"Guest Profiles", desc:"History, preferences, documents."},
              {icon:"💰", title:"Revenue Tracking", desc:"Live reports, zero guesswork."},
              {icon:"🤖", title:"HostOps AI", desc:"Auto-respond. Auto-report. Auto-grow."},
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 border-t border-slate-800 pt-8">
            {[
              {value:"500+", label:"Properties"},
              {value:"10K+", label:"Bookings"},
              {value:"98%", label:"Satisfaction"},
              {value:"24/7", label:"Support"},
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-white font-black text-lg">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-slate-600 text-xs">© 2025 HostOps · Made in India 🇮🇳</p>
      </div>

      {/* ── RIGHT — Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900">HostOps</span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-1">
                {mode === "login" ? "Welcome back 👋" : "Create account"}
              </h1>
              <p className="text-slate-500 text-sm">
                {mode === "login"
                  ? "Sign in to manage your properties."
                  : "Start your 7-day free trial today."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-5">
                <p className="text-sm font-semibold text-red-700">⚠️ {error}</p>
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-5 disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.12z"/>
                <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8 8 0 0 0 1.83 5.43L4.5 7.5a4.77 4.77 0 0 1 4.48-3.92z"/>
              </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text" value={name} onChange={(e)=>setName(e.target.value)} required
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Rajesh Kumar"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="owner@hostel.com"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  {mode === "login" && <button type="button" className="text-xs text-orange-600 hover:underline font-medium">Forgot Password?</button>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-orange-200 mt-2"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            {mode === "register" && (
              <p className="mt-3 text-center text-xs text-slate-400">
                By creating an account you agree to our{" "}
                <span className="text-orange-600 cursor-pointer hover:underline">Terms</span> &amp;{" "}
                <span className="text-orange-600 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === "login" ? "No account? " : "Already have one? "}
              <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} className="text-orange-600 font-bold hover:underline">
                {mode === "login" ? "Register free →" : "Sign in"}
              </button>
            </p>

            <p className="mt-5 text-center text-xs text-slate-400">🔒 Protected with industry-leading security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/></div>}>
      <LoginForm />
    </Suspense>
  );
}
