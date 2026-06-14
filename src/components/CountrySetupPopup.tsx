"use client";
import { useState, useEffect } from "react";

const COUNTRIES = [
  { code: "+91", name: "India", flag: "🇮🇳", currency: "INR ₹" },
  { code: "+1", name: "USA / Canada", flag: "🇺🇸", currency: "USD $" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", currency: "GBP £" },
  { code: "+971", name: "UAE", flag: "🇦🇪", currency: "AED" },
  { code: "+61", name: "Australia", flag: "🇦🇺", currency: "AUD A$" },
  { code: "+65", name: "Singapore", flag: "🇸🇬", currency: "SGD S$" },
  { code: "+49", name: "Germany", flag: "🇩🇪", currency: "EUR €" },
  { code: "+33", name: "France", flag: "🇫🇷", currency: "EUR €" },
  { code: "+974", name: "Qatar", flag: "🇶🇦", currency: "QAR" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
];

export default function CountrySetupPopup({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState("+91");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/auth/set-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: selected }),
      });
      localStorage.setItem("hostops_dial_code", selected);
      localStorage.setItem("hostops_country_set", "true");
    } catch {}
    setSaving(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 font-[family-name:var(--font-geist-sans)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-sm">H</span>
          </div>
          <span className="font-black text-slate-900 text-lg">HostOps</span>
        </div>

        <div className="mb-2">
          <span className="text-2xl">🌍</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">Where are you based?</h2>
        <p className="text-slate-500 text-sm mb-6">
          Select your country so we can show the right currency, payment methods, and ID formats for your properties.
        </p>

        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1 mb-6">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                selected === c.code
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${selected === c.code ? "text-orange-700" : "text-slate-800"}`}>
                  {c.name}
                </p>
                <p className="text-xs text-slate-400">{c.code} · {c.currency}</p>
              </div>
              {selected === c.code && (
                <span className="text-orange-500 font-bold text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-orange-200"
        >
          {saving ? "Saving..." : "Continue to Dashboard →"}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}
