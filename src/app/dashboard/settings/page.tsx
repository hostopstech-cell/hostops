"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, Lock, Eye, EyeOff, Shield,
  Globe, Building2, BedDouble, CheckCircle,
  AlertCircle, ChevronRight, Sparkles, Lock as LockIcon
} from "lucide-react";
import { getDisplayCurrency, setDisplayCurrency, getLanguage, setLanguage as saveLang } from "@/lib/currency-utils";

// ── Only languages we actually support ──────────────────────
const LANGUAGES = [
  { value: "en",  label: "🌐 English"  },
  { value: "hi",  label: "🇮🇳 हिंदी (Hindi)" },
  { value: "ar",  label: "🇦🇪 العربية (Arabic)" },
  { value: "de",  label: "🇩🇪 Deutsch (German)" },
];

// ── Dashboard display currencies ────────────────────────────
const CURRENCIES = [
  { value: "INR", label: "₹ Indian Rupee (INR)" },
  { value: "USD", label: "$ US Dollar (USD)" },
  { value: "EUR", label: "€ Euro (EUR)" },
  { value: "GBP", label: "£ British Pound (GBP)" },
  { value: "AED", label: "AED UAE Dirham (AED)" },
  { value: "SGD", label: "S$ Singapore Dollar (SGD)" },
  { value: "AUD", label: "A$ Australian Dollar (AUD)" },
  { value: "CAD", label: "C$ Canadian Dollar (CAD)" },
  { value: "QAR", label: "QAR Qatari Riyal (QAR)" },
  { value: "SAR", label: "SAR Saudi Riyal (SAR)" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata",    label: "🕐 Asia/Kolkata (GMT +05:30)" },
  { value: "UTC",             label: "🌍 UTC (GMT +00:00)" },
  { value: "Asia/Dubai",      label: "🕐 Asia/Dubai (GMT +04:00)" },
  { value: "Asia/Singapore",  label: "🕐 Asia/Singapore (GMT +08:00)" },
  { value: "Europe/London",   label: "🕐 Europe/London (GMT +00:00)" },
  { value: "America/New_York",label: "🕐 America/New_York (GMT -05:00)" },
];

// ── Dashboard translations ───────────────────────────────────
// Sirf dashboard ke common labels — full i18n library nahi chahiye
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    settings: "Settings",
    settingsDesc: "Manage your account preferences and application settings",
    contactInfo: "Contact Information",
    contactInfoDesc: "Update your personal contact details",
    fullName: "Full Name",
    mobileNumber: "Mobile Number",
    mobileNote: "Used for important alerts and notifications",
    emailAddress: "Email Address",
    emailNote: "Email cannot be changed",
    security: "Security",
    securityDesc: "Change your password and manage account security",
    currentPwd: "Current Password",
    newPwd: "New Password",
    confirmPwd: "Confirm Password",
    forgotPwd: "Forgot Password? Send reset link to email",
    updatePwd: "Update Password",
    preferences: "Preferences",
    preferencesDesc: "Set your language, currency and time preferences",
    language: "Language",
    currency: "Display Currency",
    currencyNote: "Changes how amounts appear in your dashboard. Does not affect subscription pricing.",
    timezone: "Time Zone",
    savePrefs: "Save Preferences",
    memberSince: "Member Since",
    properties: "Properties",
    rooms: "Rooms",
    accountSecure: "Your account is secure",
    accountSecureNote: "Keep your credentials safe and secure.",
    upgradePlan: "Upgrade Your Plan",
    upgradeNote: "Unlock more properties, rooms, and premium features.",
    viewPlans: "View Plans",
    unsavedChanges: "You have unsaved changes",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    loadingSettings: "Loading settings...",
    profileUpdated: "Profile updated successfully!",
    pwdUpdated: "Password updated successfully!",
    prefsSaved: "Preferences saved! Reloading...",
    nameEmpty: "Name cannot be empty",
    fillPwdFields: "Fill all password fields",
    pwdMismatch: "New passwords don't match",
    pwdMinLen: "Min 6 characters required",
    weak: "Weak", medium: "Medium", strong: "Strong",
    pwdMatch: "✓ Passwords match", pwdNoMatch: "✗ Passwords don't match",
  },
  hi: {
    settings: "सेटिंग्स",
    settingsDesc: "अपनी प्राथमिकताएं और एप्लिकेशन सेटिंग्स प्रबंधित करें",
    contactInfo: "संपर्क जानकारी",
    contactInfoDesc: "अपनी व्यक्तिगत संपर्क जानकारी अपडेट करें",
    fullName: "पूरा नाम",
    mobileNumber: "मोबाइल नंबर",
    mobileNote: "महत्वपूर्ण अलर्ट के लिए उपयोग किया जाता है",
    emailAddress: "ईमेल पता",
    emailNote: "ईमेल बदला नहीं जा सकता",
    security: "सुरक्षा",
    securityDesc: "पासवर्ड बदलें और खाता सुरक्षा प्रबंधित करें",
    currentPwd: "वर्तमान पासवर्ड",
    newPwd: "नया पासवर्ड",
    confirmPwd: "पासवर्ड की पुष्टि करें",
    forgotPwd: "पासवर्ड भूल गए? ईमेल पर रीसेट लिंक भेजें",
    updatePwd: "पासवर्ड अपडेट करें",
    preferences: "प्राथमिकताएं",
    preferencesDesc: "भाषा, मुद्रा और समय क्षेत्र सेट करें",
    language: "भाषा",
    currency: "डिस्प्ले मुद्रा",
    currencyNote: "डैशबोर्ड में राशि कैसे दिखेगी। सब्सक्रिप्शन मूल्य पर कोई असर नहीं।",
    timezone: "समय क्षेत्र",
    savePrefs: "प्राथमिकताएं सहेजें",
    memberSince: "सदस्य बने",
    properties: "संपत्तियां",
    rooms: "कमरे",
    accountSecure: "आपका खाता सुरक्षित है",
    accountSecureNote: "अपने क्रेडेंशियल सुरक्षित रखें।",
    upgradePlan: "प्लान अपग्रेड करें",
    upgradeNote: "अधिक संपत्तियां और प्रीमियम सुविधाएं अनलॉक करें।",
    viewPlans: "प्लान देखें",
    unsavedChanges: "आपके पास सहेजे नहीं गए परिवर्तन हैं",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    loadingSettings: "सेटिंग्स लोड हो रही हैं...",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!",
    pwdUpdated: "पासवर्ड सफलतापूर्वक अपडेट हुआ!",
    prefsSaved: "प्राथमिकताएं सहेजी गईं! रीलोड हो रहा है...",
    nameEmpty: "नाम खाली नहीं हो सकता",
    fillPwdFields: "सभी पासवर्ड फील्ड भरें",
    pwdMismatch: "नए पासवर्ड मेल नहीं खाते",
    pwdMinLen: "न्यूनतम 6 अक्षर आवश्यक",
    weak: "कमज़ोर", medium: "मध्यम", strong: "मज़बूत",
    pwdMatch: "✓ पासवर्ड मेल खाते हैं", pwdNoMatch: "✗ पासवर्ड मेल नहीं खाते",
  },
  ar: {
    settings: "الإعدادات",
    settingsDesc: "إدارة تفضيلاتك وإعدادات التطبيق",
    contactInfo: "معلومات الاتصال",
    contactInfoDesc: "تحديث بيانات الاتصال الشخصية",
    fullName: "الاسم الكامل",
    mobileNumber: "رقم الجوال",
    mobileNote: "يُستخدم للتنبيهات المهمة",
    emailAddress: "البريد الإلكتروني",
    emailNote: "لا يمكن تغيير البريد الإلكتروني",
    security: "الأمان",
    securityDesc: "تغيير كلمة المرور وإدارة أمان الحساب",
    currentPwd: "كلمة المرور الحالية",
    newPwd: "كلمة المرور الجديدة",
    confirmPwd: "تأكيد كلمة المرور",
    forgotPwd: "نسيت كلمة المرور؟ إرسال رابط إعادة التعيين",
    updatePwd: "تحديث كلمة المرور",
    preferences: "التفضيلات",
    preferencesDesc: "تعيين اللغة والعملة والمنطقة الزمنية",
    language: "اللغة",
    currency: "عملة العرض",
    currencyNote: "يغير طريقة عرض المبالغ في لوحة التحكم. لا يؤثر على سعر الاشتراك.",
    timezone: "المنطقة الزمنية",
    savePrefs: "حفظ التفضيلات",
    memberSince: "عضو منذ",
    properties: "العقارات",
    rooms: "الغرف",
    accountSecure: "حسابك آمن",
    accountSecureNote: "حافظ على بيانات اعتمادك آمنة.",
    upgradePlan: "ترقية الخطة",
    upgradeNote: "افتح المزيد من العقارات والميزات المتقدمة.",
    viewPlans: "عرض الخطط",
    unsavedChanges: "لديك تغييرات غير محفوظة",
    cancel: "إلغاء",
    saveChanges: "حفظ التغييرات",
    loadingSettings: "جار تحميل الإعدادات...",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح!",
    pwdUpdated: "تم تحديث كلمة المرور بنجاح!",
    prefsSaved: "تم حفظ التفضيلات! جار إعادة التحميل...",
    nameEmpty: "لا يمكن أن يكون الاسم فارغاً",
    fillPwdFields: "أكمل جميع حقول كلمة المرور",
    pwdMismatch: "كلمات المرور الجديدة غير متطابقة",
    pwdMinLen: "6 أحرف على الأقل مطلوبة",
    weak: "ضعيف", medium: "متوسط", strong: "قوي",
    pwdMatch: "✓ كلمات المرور متطابقة", pwdNoMatch: "✗ كلمات المرور غير متطابقة",
  },
  de: {
    settings: "Einstellungen",
    settingsDesc: "Verwalten Sie Ihre Einstellungen und Präferenzen",
    contactInfo: "Kontaktinformationen",
    contactInfoDesc: "Persönliche Kontaktdaten aktualisieren",
    fullName: "Vollständiger Name",
    mobileNumber: "Handynummer",
    mobileNote: "Wird für wichtige Benachrichtigungen verwendet",
    emailAddress: "E-Mail-Adresse",
    emailNote: "E-Mail kann nicht geändert werden",
    security: "Sicherheit",
    securityDesc: "Passwort ändern und Kontosicherheit verwalten",
    currentPwd: "Aktuelles Passwort",
    newPwd: "Neues Passwort",
    confirmPwd: "Passwort bestätigen",
    forgotPwd: "Passwort vergessen? Reset-Link per E-Mail senden",
    updatePwd: "Passwort aktualisieren",
    preferences: "Präferenzen",
    preferencesDesc: "Sprache, Währung und Zeitzone einstellen",
    language: "Sprache",
    currency: "Anzeigewährung",
    currencyNote: "Ändert die Anzeige von Beträgen im Dashboard. Kein Einfluss auf Abonnementpreise.",
    timezone: "Zeitzone",
    savePrefs: "Präferenzen speichern",
    memberSince: "Mitglied seit",
    properties: "Immobilien",
    rooms: "Zimmer",
    accountSecure: "Ihr Konto ist sicher",
    accountSecureNote: "Halten Sie Ihre Zugangsdaten sicher.",
    upgradePlan: "Plan upgraden",
    upgradeNote: "Mehr Immobilien und Premium-Funktionen freischalten.",
    viewPlans: "Pläne anzeigen",
    unsavedChanges: "Sie haben ungespeicherte Änderungen",
    cancel: "Abbrechen",
    saveChanges: "Änderungen speichern",
    loadingSettings: "Einstellungen werden geladen...",
    profileUpdated: "Profil erfolgreich aktualisiert!",
    pwdUpdated: "Passwort erfolgreich aktualisiert!",
    prefsSaved: "Präferenzen gespeichert! Wird neu geladen...",
    nameEmpty: "Name darf nicht leer sein",
    fillPwdFields: "Alle Passwortfelder ausfüllen",
    pwdMismatch: "Neue Passwörter stimmen nicht überein",
    pwdMinLen: "Mindestens 6 Zeichen erforderlich",
    weak: "Schwach", medium: "Mittel", strong: "Stark",
    pwdMatch: "✓ Passwörter stimmen überein", pwdNoMatch: "✗ Passwörter stimmen nicht überein",
  },
};

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

  const [language, setLanguageState] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // t = translate function
  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"][key] || key;

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const savedCurrency = getDisplayCurrency();
    const savedLanguage = getLanguage();
    const savedTimezone = localStorage.getItem("hostops_timezone") || "Asia/Kolkata";
    setCurrency(savedCurrency);
    setLanguageState(savedLanguage);
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
    if (!name.trim()) { showToast(t("nameEmpty"), "error"); return; }
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
      showToast(t("profileUpdated"), "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { showToast(t("fillPwdFields"), "error"); return; }
    if (newPwd !== confirmPwd) { showToast(t("pwdMismatch"), "error"); return; }
    if (newPwd.length < 6) { showToast(t("pwdMinLen"), "error"); return; }
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
      showToast(t("pwdUpdated"), "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    localStorage.setItem("hostops_timezone", timezone);
    setTimeout(() => {
      setSavingPrefs(false);
      showToast(t("prefsSaved"), "success");
    }, 300);
  };

  const isOnTrial = (subData?.plan || owner?.plan) === "trial";
  const totalRooms = rooms.length;
  const memberSince = owner?.memberSince
    ? new Date(owner.memberSince).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const pwdStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: t("weak"), color: "bg-red-400", width: "33%" };
    if (pwd.length < 10) return { label: t("medium"), color: "bg-amber-400", width: "66%" };
    return { label: t("strong"), color: "bg-emerald-500", width: "100%" };
  };
  const strength = pwdStrength(newPwd);

  // Arabic RTL support
  const isRTL = language === "ar";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-10 w-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">{t("loadingSettings")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto p-4 md:p-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("settings")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("settingsDesc")}</p>
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
                <p className="text-sm font-bold text-slate-900">{t("contactInfo")}</p>
                <p className="text-xs text-slate-500">{t("contactInfoDesc")}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("fullName")}</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                    placeholder={t("fullName")} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("mobileNumber")}</label>
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
                <p className="text-xs text-slate-400 mt-1.5">{t("mobileNote")}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("emailAddress")}</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} readOnly
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50 cursor-not-allowed" />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{t("emailNote")}</p>
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
                <p className="text-sm font-bold text-slate-900">{t("security")}</p>
                <p className="text-xs text-slate-500">{t("securityDesc")}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: t("currentPwd"), val: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { label: t("newPwd"),     val: newPwd,     set: setNewPwd,     show: showNew,     toggle: () => setShowNew(!showNew) },
                  { label: t("confirmPwd"), val: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{f.label}</label>
                    <div className="relative">
                      <input type={f.show ? "text" : "password"} value={f.val}
                        onChange={e => f.set(e.target.value)}
                        className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                          i === 1 && newPwd
                            ? strength?.label === t("weak")   ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                            : strength?.label === t("medium") ? "border-amber-300 focus:ring-amber-400 bg-amber-50/30"
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
                          strength.color.includes("red") ? "text-red-500" : strength.color.includes("amber") ? "text-amber-500" : "text-emerald-500"
                        }`}>{strength.label}</p>
                      </div>
                    )}
                    {i === 2 && confirmPwd && (
                      <p className={`text-[10px] mt-1 font-semibold ${confirmPwd === newPwd ? "text-emerald-500" : "text-red-500"}`}>
                        {confirmPwd === newPwd ? t("pwdMatch") : t("pwdNoMatch")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <button className="text-xs text-orange-500 font-semibold hover:underline">{t("forgotPwd")}</button>
                <button onClick={handleUpdatePassword} disabled={savingPwd}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {savingPwd ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={14} />}
                  {t("updatePwd")}
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
                <p className="text-sm font-bold text-slate-900">{t("preferences")}</p>
                <p className="text-xs text-slate-500">{t("preferencesDesc")}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-xl">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("language")}</label>
                  <select value={language} disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                  <div className="absolute inset-0 top-7 backdrop-blur-[3px] bg-white/60 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">🔒 Coming Soon</span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("currency")}</label>
                  <select value={currency} disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <div className="absolute inset-0 top-7 backdrop-blur-[3px] bg-white/60 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">🔒 Coming Soon</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">{t("timezone")}</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    {TIMEZONES.map(t2 => <option key={t2.value} value={t2.value}>{t2.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button onClick={handleSavePreferences} disabled={savingPrefs}
                  className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {savingPrefs ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Globe size={14} />}
                  {t("savePrefs")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
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
                <span className="text-xs text-slate-500">{t("memberSince")}</span>
                <span className="text-xs font-semibold text-slate-900">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <span className="text-xs text-slate-500">{t("properties")}</span>
                <div className="flex items-center gap-1.5">
                  <Building2 size={12} className="text-orange-500" />
                  <span className="text-xs font-semibold text-slate-900">{properties.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-slate-500">{t("rooms")}</span>
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
                <p className="text-sm font-bold text-orange-900">{t("accountSecure")}</p>
                <p className="text-xs text-orange-600 mt-0.5">{t("accountSecureNote")}</p>
              </div>
            </div>
          </div>

          {isOnTrial && (
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} />
                <p className="text-sm font-bold">{t("upgradePlan")}</p>
              </div>
              <p className="text-xs text-orange-100 mb-4">{t("upgradeNote")}</p>
              <button onClick={() => router.push("/dashboard/subscription")}
                className="w-full py-2.5 bg-white text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-1.5">
                {t("viewPlans")} <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-400" />
            <span className="text-sm font-medium">{t("unsavedChanges")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setName(owner?.name || ""); setPhone(owner?.phone || ""); }}
              className="px-4 py-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium">
              {t("cancel")}
            </button>
            <button onClick={handleSaveContact} disabled={saving}
              className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {t("saveChanges")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
