"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, Lock, Eye, EyeOff, Shield,
  Globe, Building2, BedDouble, CheckCircle,
  AlertCircle, ChevronRight, Sparkles, Lock as LockIcon
} from "lucide-react";

const CURRENCIES = [
  { value: "INR", label: "₹ Indian Rupee (INR)", symbol: "₹" },
  { value: "USD", label: "$ US Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "€ Euro (EUR)", symbol: "€" },
  { value: "GBP", label: "£ British Pound (GBP)", symbol: "£" },
  { value: "AED", label: "د.إ UAE Dirham (AED)", symbol: "د.إ" },
  { value: "SGD", label: "S$ Singapore Dollar (SGD)", symbol: "S$" },
  { value: "AUD", label: "A$ Australian Dollar (AUD)", symbol: "A$" },
  { value: "CAD", label: "C$ Canadian Dollar (CAD)", symbol: "C$" },
  { value: "JPY", label: "¥ Japanese Yen (JPY)", symbol: "¥" },
  { value: "THB", label: "฿ Thai Baht (THB)", symbol: "฿" },
];

const LANGUAGES = [
  { value: "en", label: "🌐 English" },
  { value: "hi", label: "🇮🇳 Hindi" },
  { value: "mr", label: "🇮🇳 Marathi" },
  { value: "gu", label: "🇮🇳 Gujarati" },
  { value: "ta", label: "🇮🇳 Tamil" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "🕐 Asia/Kolkata (GMT +05:30)" },
  { value: "UTC", label: "🌍 UTC (GMT +00:00)" },
  { value: "Asia/Dubai", label: "🕐 Asia/Dubai (GMT +04:00)" },
  { value: "Asia/Singapore", label: "🕐 Asia/Singapore (GMT +08:00)" },
  { value: "Europe/London", label: "🕐 Europe/London (GMT +00:00)" },
  { value: "America/New_York", label: "🕐 America/New_York (GMT -05:00)" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<any>(null);
  const [subData, setSubData] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedCurrency = localStorage.getItem("hostops_currency") || "INR";
    const savedLanguage = localStorage.getItem("hostops_language") || "en";
    const savedTimezone = localStorage.getItem("hostops_timezone") || "Asia/Kolkata";
    setCurrency(savedCurrency);
    setLanguage(savedLanguage);
    setTimezone(savedTimezone);

    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/subscription").then(r => r.json()),
      fetch("/api/properties").then(r => r.json()),
      fetch("/api/rooms").then(r => r.json()),
    ]).then(([authData, subRes, propsData, roomsData]) => {
      if (!authData?.owner) { router.push("/login"); return; }
      const o = authData.owner;
      setOwner(o);
      setName(o.name || "");
      setPhone(o.phone || "");
      setEmail(o.email || "");
      if (subRes?.plan) setSubData(subRes);
      if (propsData?.properties) setProperties(propsData.properties);
      if (roomsData?.rooms) setRooms(roomsData.rooms);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!owner) return;
    setHasChanges(name !== (owner.name || "") || phone !== (owner.phone || ""));
  }, [name, phone, owner]);

  const handleSaveContact = async () => {
    if (!name.trim()) { showToast("Name cannot be empty", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to save", "error"); return; }
      setOwner((prev: any) => ({ ...prev, name, phone }));
      setHasChanges(false);
      showToast("Profile updated successfully!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { showToast("Fill all password fields", "error"); return; }
    if (newPwd !== confirmPwd) { showToast("New passwords don't match", "error"); return; }
    if (newPwd.length < 6) { showToast("Min 6 characters required", "error"); return; }
    setSavingPwd(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to update password", "error"); return; }
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      showToast("Password updated successfully!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    localStorage.setItem("hostops_currency", currency);
    localStorage.setItem("hostops_language", language);
    localStorage.setItem("hostops_timezone", timezone);
    // Dispatch event so other pages can react
    window.dispatchEvent(new CustomEvent("hostops_prefs_changed", {
      detail: { currency, language, timezone }
    }));
    setTimeout(() => {
      setSavingPrefs(false);
      showToast("Preferences saved successfully!", "success");
    }, 400);
  };

  const isOnTrial = (subData?.plan || owner?.plan) === "trial";
  const totalRooms = rooms.length;
  const memberSince = owner?.memberSince
    ? new Date(owner.memberSince).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const pwdStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: "Weak", color: "bg-red-400", width: "33%" };
    if (pwd.length < 10) return { label: "Medium", color: "bg-amber-400", width: "66%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  };
  const strength = pwdStrength(newPwd);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-10 w-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences and application settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-5">

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-sm">
              <User size={15} /> Account
            </button>
            <div className="relative">
              <button disabled className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-300 text-sm font-semibold border border-slate-200 cursor-not-allowed select-none">
                <LockIcon size={15} /> More Settings
              </button>
              <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-slate-700 text-white px-1.5 py-0.5 rounded-full">Soon</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <User size={15} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Contact Information</p>
                <p className="text-xs text-slate-500">Update your personal contact details</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                    placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 font-medium whitespace-nowrap">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                      placeholder="98765 43210" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Used for important alerts and notifications</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} readOnly
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50 cursor-not-allowed" />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Security</p>
                <p className="text-xs text-slate-500">Change your password and manage account security</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Current Password", val: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { label: "New Password", val: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(!showNew) },
                  { label: "Confirm Password", val: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{f.label}</label>
                    <div className="relative">
                      <input type={f.show ? "text" : "password"} value={f.val}
                        onChange={e => f.set(e.target.value)}
                        className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                          i === 1 && newPwd
                            ? strength?.label === "Weak" ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                            : strength?.label === "Medium" ? "border-amber-300 focus:ring-amber-400 bg-amber-50/30"
                            : "border-emerald-300 focus:ring-emerald-400 bg-emerald-50/30"
                            : i === 2 && confirmPwd
                            ? confirmPwd === newPwd ? "border-emerald-300 focus:ring-emerald-400 bg-emerald-50/30" : "border-red-300 focus:ring-red-400 bg-red-50/30"
                            : "border-slate-200 focus:ring-blue-400"
                        }`}
                        placeholder="••••••••" />
                      <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {i === 1 && newPwd && strength && (
                      <div className="mt-1.5">
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                        </div>
                        <p className={`text-[10px] mt-0.5 font-semibold ${
                          strength.label === "Weak" ? "text-red-500" : strength.label === "Medium" ? "text-amber-500" : "text-emerald-500"
                        }`}>{strength.label}</p>
                      </div>
                    )}
                    {i === 2 && confirmPwd && (
                      <p className={`text-[10px] mt-1 font-semibold ${confirmPwd === newPwd ? "text-emerald-500" : "text-red-500"}`}>
                        {confirmPwd === newPwd ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <button className="text-xs text-orange-500 font-semibold hover:underline">
                  Forgot Password? Send reset link to email
                </button>
                <button onClick={handleUpdatePassword} disabled={savingPwd}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {savingPwd
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Lock size={14} />}
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Preferences</p>
                <p className="text-xs text-slate-500">Set your language, currency and time preferences</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Time Zone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button onClick={handleSavePreferences} disabled={savingPrefs}
                  className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {savingPrefs
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Globe size={14} />}
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {owner?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{owner?.name || "—"}</p>
                  <p className="text-slate-400 text-xs truncate">{owner?.email || "—"}</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <span className="text-xs text-slate-500">Member Since</span>
                <span className="text-xs font-semibold text-slate-900">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <span className="text-xs text-slate-500">Properties</span>
                <div className="flex items-center gap-1.5">
                  <Building2 size={12} className="text-orange-500" />
                  <span className="text-xs font-semibold text-slate-900">{properties.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-slate-500">Rooms</span>
                <div className="flex items-center gap-1.5">
                  <BedDouble size={12} className="text-blue-500" />
                  <span className="text-xs font-semibold text-slate-900">{totalRooms}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={14} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-900">Your account is secure</p>
                <p className="text-xs text-orange-600 mt-0.5">Keep your credentials safe and secure.</p>
              </div>
            </div>
          </div>

          {isOnTrial && (
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} />
                <p className="text-sm font-bold">Upgrade Your Plan</p>
              </div>
              <p className="text-xs text-orange-100 mb-4">Unlock more properties, rooms, and premium features.</p>
              <button onClick={() => router.push("/dashboard/subscription")}
                className="w-full py-2.5 bg-white text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-1.5">
                View Plans <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-400" />
            <span className="text-sm font-medium">You have unsaved changes</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setName(owner?.name || ""); setPhone(owner?.phone || ""); }}
              className="px-4 py-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Cancel
            </button>
            <button onClick={handleSaveContact} disabled={saving}
              className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
