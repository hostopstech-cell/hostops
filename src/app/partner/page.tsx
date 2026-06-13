"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/partner/me").then(r => r.json()).then(d => {
      if (d.agent) router.push("/partner/dashboard");
      else setCheckingAuth(false);
    }).catch(() => setCheckingAuth(false));
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "owner_account") setError("⚠️ This Google account is already registered as a property owner. Please use a different Google account to join as a partner.");
    else if (err === "inactive") setError("Your partner account is inactive. Please contact support.");
    else if (err) setError("Sign-in failed. Please try again.");
  }, []);

  function handleGoogleSignIn() {
    setLoading(true); setError("");
    const clientId = "155964386591-bf4v84fvn6p1p7psqaa3oc5tvlg0472p.apps.googleusercontent.com";
    const redirectUri = encodeURIComponent(window.location.origin + "/api/partner/google-callback");
    const scope = encodeURIComponent("email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;
    window.location.href = url;
  }

  if (checkingAuth) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-600 text-sm font-medium">Partner Program • Earn with HostOps</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
            Refer Hotels.<br />
            <span className="text-orange-500">Earn Commission.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Join HostOps Partner Program. Help property owners grow their business and earn a commission on every successful onboarding.
          </p>

          {error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-lg text-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 mb-20">
            {[
              { label: "Commission Earned", value: "Per Sale", icon: "₹" },
              { label: "Payment Method", value: "UPI / Bank", icon: "🏦" },
              { label: "Payout Time", value: "Within 24hrs", icon: "⚡" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-xl font-bold text-slate-900">{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-slate-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Sign Up", desc: "Continue with Google and get your unique referral code instantly." },
                { step: "02", title: "Add Lead", desc: "Enter your prospect's email to reserve them under your account." },
                { step: "03", title: "They Join", desc: "When they register and purchase a plan, you get commission." },
                { step: "04", title: "Get Paid", desc: "Receive payment via UPI or bank transfer within 24 hours." },
              ].map((s, i) => (
                <div key={i} className="relative bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
                  <div className="text-4xl font-black text-orange-500/30 mb-3">{s.step}</div>
                  <div className="font-semibold text-slate-900 mb-2">{s.title}</div>
                  <div className="text-slate-500 text-sm">{s.desc}</div>
                  {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 text-orange-500 text-xl">›</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
