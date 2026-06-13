"use client";
import ConfirmModal from '@/components/ConfirmModal';
import { useEffect, useState } from "react";
import type { Property } from "@/types";

const TYPE_ICONS: Record<string, string> = { hostel: "🏨", hotel: "🏩", guesthouse: "🏡", default: "🏠" };
const TYPE_BG: Record<string, string> = {
  hostel: "from-orange-50 to-orange-100", hotel: "from-blue-50 to-blue-100",
  guesthouse: "from-green-50 to-green-100", default: "from-slate-50 to-slate-100",
};
const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"];
const emptyForm = () => ({
  name: "", type: "hostel", address: "", city: "", state: "Rajasthan",
  pincode: "", contactNumber: "", countryCode: "+91", email: "", totalBeds: "", description: "",
  checkInTime: "14:00", checkOutTime: "11:00", status: "active", amenities: [] as string[],
});
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://hostops-six.vercel.app";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentProp, setPaymentProp] = useState<Property | null>(null);
  const [upiId, setUpiId] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentFromBot, setPaymentFromBot] = useState(false);
  const [botLinkProp, setBotLinkProp] = useState<Property | null>(null);
  const [copied, setCopied] = useState(false);
  const [staffLinkProp, setStaffLinkProp] = useState<Property | null>(null);
  const [staffToken, setStaffToken] = useState("");
  const [staffTokenSaving, setStaffTokenSaving] = useState(false);
  const [staffLinkCopied, setStaffLinkCopied] = useState(false);

  async function fetchProperties() {
    const res = await fetch("/api/properties");
    const data = await res.json();
    setProperties(data.properties || []);
    setLoading(false);
  }
  useEffect(() => { fetchProperties(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  function openAdd() { setEditingProperty(null); setForm(emptyForm()); setError(""); setShowModal(true); }
  function openEdit(p: Property) {
    setEditingProperty(p);
    setForm({
      name: p.name || "", type: p.type || "hostel",
      address: (p as any).address || "", city: (p as any).city || "",
      state: (p as any).state || "Rajasthan", pincode: (p as any).pincode || "",
      contactNumber: (p as any).contact_number || "", email: (p as any).email || "",
      totalBeds: String(p.total_beds || ""), description: (p as any).description || "",
      checkInTime: (p as any).check_in_time || "14:00", checkOutTime: (p as any).check_out_time || "11:00",
      status: p.status || "active", amenities: (p as any).amenities || [],
    });
    setError(""); setShowModal(true);
  }

  async function doDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/properties/${deleteId}`, { method: "DELETE" });
    setConfirmOpen(false); setDeleteId(null);
    if (res.ok) { setSuccess("Property deleted!"); fetchProperties(); }
    else setError("Failed to delete");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const phoneDigits = form.contactNumber.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneDigits)) {
      setError("Please enter a valid 10-digit contact number.");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : "/api/properties";
      const method = editingProperty ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, type: form.type, address: form.address, city: form.city,
          state: form.state, pincode: form.pincode, contactNumber: form.contactNumber,
          email: form.email, totalBeds: form.totalBeds, description: form.description,
          checkInTime: form.checkInTime, checkOutTime: form.checkOutTime,
          status: form.status, amenities: form.amenities,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(editingProperty ? "Property updated!" : "Property created!");
      setShowModal(false); fetchProperties();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function savePaymentDetails() {
    if (!paymentProp) return;
    if (!paymentName.trim() || !upiId.trim()) {
      setError("Owner name aur UPI ID dono required hain");
      return;
    }
    setPaymentSaving(true);
    await fetch(`/api/properties/${(paymentProp as any).id}/payment`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upi_id: upiId.trim(), payment_name: paymentName.trim() }),
    });
    setPaymentSaving(false);
    setPaymentModal(false);
    setError("");
    // Agar payment bot activate karne ke liye khola tha, ab bot activate karo
    if (paymentFromBot) {
      setPaymentFromBot(false);
      const updatedProp = { ...paymentProp, upi_id: upiId.trim() } as any;
      await fetch(`/api/properties/${(paymentProp as any).id}/bot-toggle`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_enabled: true }),
      });
      setSuccess("UPI saved & Bot activated! 🤖");
      fetchProperties();
      setBotLinkProp({ ...updatedProp, bot_enabled: true });
    } else {
      setSuccess("Payment details saved!");
      fetchProperties();
    }
  }

  async function saveStaffToken() {
    if (!staffLinkProp || !staffToken.trim()) return;
    setStaffTokenSaving(true);
    await fetch(`/api/properties/${(staffLinkProp as any).id}/staff-token`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_token: staffToken.trim() }),
    });
    setStaffTokenSaving(false);
    setSuccess("Staff access code saved!");
    fetchProperties();
  }

  function copyStaffLink(propId: number) {
    const link = `${SITE_URL}/staff/${propId}`;
    navigator.clipboard.writeText(link);
    setStaffLinkCopied(true);
    setTimeout(() => setStaffLinkCopied(false), 2000);
  }

  async function toggleBot(p: Property) {
    const newVal = !(p as any).bot_enabled;
    // Bot activate karne se pehle UPI mandatory check
    if (newVal && !(p as any).upi_id) {
      setPaymentProp(p);
      setUpiId("");
      setPaymentName("");
      setPaymentFromBot(true);
      setPaymentModal(true);
      return;
    }
    await fetch(`/api/properties/${p.id}/bot-toggle`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_enabled: newVal }),
    });
    setSuccess(newVal ? "Bot activated! 🤖" : "Bot deactivated");
    fetchProperties();
    if (newVal) setBotLinkProp({ ...p, bot_enabled: newVal } as any);
  }

  function copyBotLink(propId: number) {
    const link = `${SITE_URL}/book/${propId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalBeds = properties.reduce((s, p) => s + Number(p.total_beds || 0), 0);
  const occupied = properties.reduce((s, p) => s + Number((p as any).occupied_beds || 0), 0);
  const activeProps = properties.filter(p => p.status === "active").length;
  const avgOcc = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  const filtered = properties
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || (p as any).city?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "occupancy") return Number((b as any).occupied_beds || 0) - Number((a as any).occupied_beds || 0);
      if (sortBy === "beds") return Number(b.total_beds || 0) - Number(a.total_beds || 0);
      return 0;
    });

  return (
    <div className="space-y-6 pb-8">
      <ConfirmModal isOpen={confirmOpen} title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel="Delete" onConfirm={doDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} />
      {success && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">✓ {success}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all your properties</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap">
          <span className="text-lg leading-none">+</span> Add Property
        </button>
      </div>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: "Total Properties", value: properties.length, sub: "Active properties", icon: "🏨", bg: "bg-orange-50", iconBg: "bg-orange-100", val: "text-orange-600" },
          { label: "Active Properties", value: activeProps, sub: `${properties.length > 0 ? Math.round((activeProps/properties.length)*100) : 0}% of total`, icon: "✅", bg: "bg-green-50", iconBg: "bg-green-100", val: "text-green-600" },
          { label: "Total Rooms", value: totalBeds, sub: "Across all properties", icon: "🛏️", bg: "bg-violet-50", iconBg: "bg-violet-100", val: "text-violet-600" },
          { label: "Avg Occupancy", value: `${avgOcc}%`, sub: `${occupied} of ${totalBeds} beds`, icon: "📊", bg: "bg-blue-50", iconBg: "bg-blue-100", val: "text-blue-600" },
        ] as any[]).map(({ label, value, sub, icon, bg, iconBg, val }) => (
          <div key={label} className={`rounded-2xl p-4 border border-white shadow-sm ${bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center text-lg`}>{icon}</div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${val} mb-1`}>{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or city..."
          className="input-field text-sm flex-1 min-w-[200px] max-w-xs" />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="input-field text-sm w-auto">
          <option value="name">Sort: Name</option>
          <option value="occupancy">Sort: Occupancy</option>
          <option value="beds">Sort: Total Rooms</option>
        </select>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No properties found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const icon = TYPE_ICONS[p.type] || TYPE_ICONS.default;
            const bg = TYPE_BG[p.type] || TYPE_BG.default;
            const totalB = Number(p.total_beds || 0);
            const occB = Number((p as any).occupied_beds || 0);
            const availB = totalB - occB;
            const occ = totalB > 0 ? Math.round(occB / totalB * 100) : 0;
            const botEnabled = (p as any).bot_enabled;
            const hasPayment = !!(p as any).upi_id;
            const hasStaffToken = !!(p as any).staff_token;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                {/* Card header */}
                <div className={`h-32 bg-gradient-to-br ${bg} flex items-center justify-center relative`}>
                  <span className="text-6xl">{icon}</span>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      ● {p.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => openEdit(p)} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-orange-500 shadow-sm text-sm">✏️</button>
                    <button onClick={() => { setDeleteId(p.id); setConfirmOpen(true); }} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm text-sm">🗑</button>
                  </div>
                </div>

                <div className="p-4">
                  {/* Name + UPI */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{p.type}</p>
                    </div>
                    <button
                      onClick={() => { setPaymentProp(p); setUpiId(""); setPaymentName(""); setPaymentFromBot(false); setPaymentModal(true); }}
                      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${hasPayment ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-orange-50 hover:text-orange-600"}`}>
                      💳 {hasPayment ? "UPI ✓" : "Add UPI"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {(p as any).city}, {(p as any).state}
                  </p>

                  {/* Occupancy bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Occupancy</span>
                      <span className={`font-semibold ${occ >= 80 ? "text-red-500" : occ >= 50 ? "text-amber-500" : "text-green-600"}`}>{occ}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-full rounded-full transition-all ${occ >= 80 ? "bg-red-400" : occ >= 50 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${occ}%` }} />
                    </div>
                  </div>

                  {/* Bed stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ label: "Total", value: totalB }, { label: "Occupied", value: occB, red: true }, { label: "Available", value: availB, green: true }].map(s => (
                      <div key={s.label} className={`rounded-xl p-2 text-center ${s.red ? "bg-red-50" : s.green ? "bg-green-50" : "bg-slate-50"}`}>
                        <div className={`text-base font-bold ${s.red ? "text-red-500" : s.green ? "text-green-600" : "text-slate-700"}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Check-in/out */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mb-3">
                    <span>🕐 {(p as any).check_in_time || "14:00"} – {(p as any).check_out_time || "11:00"}</span>
                    <span className="capitalize">🏷️ {p.type}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <a href={`/dashboard/rooms?property=${p.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all">
                      🛏️ Manage Rooms
                    </a>
                    <button
                      onClick={() => { setStaffLinkProp(p); setStaffToken((p as any).staff_token || ""); }}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${hasStaffToken ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"}`}>
                      👥 Staff Access
                    </button>
                  </div>

                  {/* Booking Bot */}
                  <div className={`rounded-xl p-3 border ${botEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🤖</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Booking Bot</p>
                          <p className={`text-[10px] font-semibold ${botEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                            {botEnabled ? "● Active" : "○ Inactive"}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => toggleBot(p)}
                        title={!hasPayment && !botEnabled ? "UPI details required" : ""}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${botEnabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${botEnabled ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {/* UPI missing warning under bot */}
                    {!hasPayment && !botEnabled && (
                      <p className="text-[10px] text-amber-600 mt-2 font-medium">⚠️ Add UPI details first to activate the bot</p>
                    )}
                    {botEnabled && (
                      <div className="mt-2">
                        <p className="text-[10px] text-slate-500 mb-1 font-medium">Guest booking link:</p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 overflow-hidden">
                            <p className="text-[10px] text-slate-600 font-mono truncate">{SITE_URL}/book/{p.id}</p>
                          </div>
                          <button onClick={() => copyBotLink(p.id)}
                            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg">
                            {copied ? "✓" : "📋"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Performance Table */}
      {properties.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Property Performance Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by occupancy</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Rank</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Property</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Location</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Occupancy</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Total Rooms</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Occupied</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Available</th>
                </tr>
              </thead>
              <tbody>
                {[...properties]
                  .sort((a, b) => Number((b as any).occupied_beds || 0) - Number((a as any).occupied_beds || 0))
                  .map((p, i) => {
                    const totalB = Number(p.total_beds || 0);
                    const occB = Number((p as any).occupied_beds || 0);
                    const occ = totalB > 0 ? Math.round(occB / totalB * 100) : 0;
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}>{i + 1}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span>{TYPE_ICONS[p.type] || TYPE_ICONS.default}</span>
                            <span className="font-semibold text-slate-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{(p as any).city}, {(p as any).state}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`font-semibold ${occ >= 80 ? "text-red-500" : occ >= 50 ? "text-amber-500" : "text-green-600"}`}>{occ}%</span>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-700 font-medium">{totalB}</td>
                        <td className="px-5 py-3 text-right text-red-500 font-medium">{occB}</td>
                        <td className="px-5 py-3 text-right text-green-600 font-medium">{totalB - occB}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Property Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{editingProperty ? "Edit Property" : "Add Property"}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="off" className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type *</label>
                  <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field w-full text-sm text-slate-900">
                    <option value="hostel">Hostel</option><option value="hotel">Hotel</option><option value="guesthouse">Guesthouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Rooms *</label>
                  <input required type="number" min={1} value={form.totalBeds} onChange={e => setForm(f => ({ ...f, totalBeds: e.target.value }))} autoComplete="off" className="input-field w-full text-sm text-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address *</label>
                  <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} autoComplete="off" className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">City *</label>
                  <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} autoComplete="off" className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label>
                  <select required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field w-full text-sm text-slate-900">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} autoComplete="off" className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode || "+91"}
                      onChange={e => setForm(f => ({ ...f, countryCode: e.target.value } as any))}
                      className="input-field text-sm text-slate-900 w-24"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>
                    <input
                      value={form.contactNumber}
                      onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      autoComplete="off"
                      placeholder="10-digit number"
                      maxLength={10}
                      required
                      className="input-field flex-1 text-sm text-slate-900"
                    />
                  </div>
                  {form.contactNumber && form.contactNumber.length !== 10 && (
                    <p className="text-xs text-red-500 mt-1">Please make sure you are entering the correct 10-digit number.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-in Time</label>
                  <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-out Time</label>
                  <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className="input-field w-full text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full text-sm text-slate-900">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? "Saving..." : editingProperty ? "Update Property" : "Create Property"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && paymentProp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">💳</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Payment Details</h2>
                <p className="text-xs text-slate-500">{(paymentProp as any).name}</p>
              </div>
            </div>
            {/* Bot se aaya hai toh warning */}
            {paymentFromBot && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-amber-700 font-semibold">⚠️ UPI details are required to activate the booking bot</p>
                <p className="text-xs text-amber-600 mt-0.5">Please enter the correct details so payments reach your account. The bot will activate automatically after saving.</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Owner / Account Name <span className="text-red-500">*</span></label>
                <input
                  value={paymentName}
                  onChange={e => setPaymentName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">UPI ID <span className="text-red-500">*</span></label>
                <input
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. rajesh@upi"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
                />
              </div>
            </div>
            {error && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={savePaymentDetails} disabled={paymentSaving} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60">
                {paymentSaving ? "Saving..." : paymentFromBot ? "Save & Activate Bot" : "Save Payment Details"}
              </button>
              <button onClick={() => { setPaymentModal(false); setPaymentFromBot(false); setError(""); }} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Access Modal */}
      {staffLinkProp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">👥</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Staff Access</h2>
                <p className="text-xs text-slate-500">{(staffLinkProp as any).name}</p>
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-indigo-700 font-medium">🔒 Staff can only see last 7 days bookings — no revenue totals, no settings, no other data</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Staff Access Code</label>
                <input value={staffToken} onChange={e => setStaffToken(e.target.value)}
                  placeholder="e.g. staff123 (set a secret code)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
                <p className="text-xs text-slate-400 mt-1">Staff will enter this code to access bookings</p>
              </div>
              {staffToken && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Staff Link</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 overflow-hidden">
                      <p className="text-xs text-slate-600 font-mono truncate">{SITE_URL}/staff/{staffLinkProp.id}</p>
                    </div>
                    <button onClick={() => copyStaffLink(staffLinkProp.id)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
                      {staffLinkCopied ? "✓" : "📋"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveStaffToken} disabled={staffTokenSaving || !staffToken.trim()}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
                {staffTokenSaving ? "Saving..." : "Save & Share"}
              </button>
              <button onClick={() => setStaffLinkProp(null)} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bot Link Modal */}
      {botLinkProp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-4">
              <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🤖</div>
              <h2 className="text-lg font-bold text-slate-800">Bot Activated!</h2>
              <p className="text-sm text-slate-500 mt-1">{(botLinkProp as any).name} — Guest bot is now live</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 font-medium mb-2">Share this link with your guests:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 overflow-hidden">
                  <p className="text-xs text-slate-700 font-mono truncate">{SITE_URL}/book/{botLinkProp.id}</p>
                </div>
                <button onClick={() => copyBotLink(botLinkProp.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg">
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>
            <button onClick={() => setBotLinkProp(null)} className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
