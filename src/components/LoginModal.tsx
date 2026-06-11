"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface Props { onClose: () => void; }

export default function LoginModal({ onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      router.push("/dashboard"); router.refresh(); onClose();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const inputClass = "w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 font-[family-name:var(--font-geist-sans)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">×</button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black">H</span>
          </div>
          <span className="font-black text-slate-900 text-lg">HostOps</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {mode === "login" ? "Welcome back 👋" : "Create account"}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {mode === "login" ? "Sign in to manage your properties." : "Start your 7-day free trial today."}
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-red-700">⚠️ {error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-5 disabled:opacity-60"
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
          <span className="text-xs text-slate-400 font-medium">or email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required
                className={inputClass} placeholder="Rajesh Kumar" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
              className={inputClass} placeholder="owner@hostel.com" />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              {mode==="login" && <button type="button" className="text-xs text-orange-600 hover:underline font-medium">Forgot Password?</button>}
            </div>
            <div className="relative">
              <input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6}
                className={`${inputClass} pr-12`} placeholder="••••••••" />
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword?"🙈":"👁️"}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-orange-200">
            {loading ? "Please wait..." : mode==="login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {mode==="login" ? "No account? " : "Already have one? "}
          <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} className="text-orange-600 font-bold hover:underline">
            {mode==="login" ? "Register free →" : "Sign in"}
          </button>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">🔒 Protected with industry-leading security</p>
      </div>
    </div>
  );
}
