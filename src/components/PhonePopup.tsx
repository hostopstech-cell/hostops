"use client";
import { useState } from "react";
import { setDialCode } from "@/lib/currency-utils";

const DIAL_CODES = [
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+81",  flag: "🇯🇵", name: "Japan" },
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+66",  flag: "🇹🇭", name: "Thailand" },
  { code: "+62",  flag: "🇮🇩", name: "Indonesia" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico" },
];

interface PhonePopupProps {
  onComplete: (dialCode: string, phone: string) => void;
}

export default function PhonePopup({ onComplete }: PhonePopupProps) {
  const [dialCode, setDialCodeState] = useState("+91");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedDial = DIAL_CODES.find(d => d.code === dialCode) || DIAL_CODES[0];

  const handleSubmit = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Please enter a valid phone number (min 7 digits)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, dialCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save phone number");
        setLoading(false);
        return;
      }
      // Save to localStorage
      setDialCode(dialCode);
      onComplete(dialCode, phone);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Top gradient header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 pt-8 pb-6 relative overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full opacity-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400 rounded-full opacity-10 blur-2xl" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-2xl">📱</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">One last step!</h2>
            <p className="text-slate-400 text-sm">
              Add your phone number to unlock <span className="text-orange-400 font-semibold">personalised pricing</span> for your country.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          {/* Country + Phone input */}
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Your Phone Number
          </label>
          <div className="flex gap-2 mb-1">
            {/* Dial code dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap h-full"
              >
                <span className="text-lg">{selectedDial.flag}</span>
                <span>{selectedDial.code}</span>
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-56 max-h-64 overflow-y-auto">
                  {DIAL_CODES.map(d => (
                    <button key={d.code}
                      onClick={() => { setDialCodeState(d.code); setDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 transition-colors text-sm ${dialCode === d.code ? "bg-orange-50 text-orange-700 font-semibold" : "text-slate-700"}`}>
                      <span className="text-lg">{d.flag}</span>
                      <span className="flex-1 truncate">{d.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{d.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone number input */}
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^0-9\s\-]/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="98765 43210"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}

          {/* Info note */}
          <p className="text-xs text-slate-400 mt-3 mb-6 flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0">🔒</span>
            <span>Your number is used only to set the right currency for your region. We will never spam you.</span>
          </p>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || phone.replace(/\D/g, "").length < 7}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-orange-500/20 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Continue to Dashboard →"
            )}
          </button>

          {/* Supported countries */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Serving property owners in</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["🇮🇳","🇺🇸","🇬🇧","🇦🇪","🇦🇺","🇸🇬","🇩🇪","🇫🇷","🇶🇦","🇸🇦"].map(flag => (
                <span key={flag} className="text-xl">{flag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
