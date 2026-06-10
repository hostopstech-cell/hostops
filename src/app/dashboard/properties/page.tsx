"use client";
import ConfirmModal from '@/components/ConfirmModal';
import { useEffect, useState } from "react";
import type { Property } from "@/types";

const TYPE_ICONS: Record<string, string> = { hostel: "🏨", hotel: "🏩", guesthouse: "🏡", default: "🏠" };
const TYPE_BG: Record<string, string> = { hostel: "from-orange-50 to-orange-100", hotel: "from-blue-50 to-blue-100", guesthouse: "from-green-50 to-green-100", default: "from-slate-50 to-slate-100" };
const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"];
const emptyForm = () => ({ name: "", type: "hostel", address: "", city: "", state: "Rajasthan", pincode: "", contactNumber: "", email: "", totalBeds: "", description: "", checkInTime: "14:00", checkOutTime: "11:00", upiId: "", paymentName: "", status: "active", amenities: [] as string[] });
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [botLinkProp, setBotLinkProp] = useState<Property | null>(null);
  const [copied, setCopied] = useState(false);

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
      contactNumber: (p as any).contact || "", email: (p as any).email || "",
      totalBeds: String(p.total_beds || ""), description: (p as any).description || "",
      checkInTime: (p as any).check_in_time || "14:00", checkOutTime: (p as any).check_out_time || "11:00",
      upiId: (p as any).upi_id || "", paymentName: (p as any).payment_name || "",
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
    e.preventDefault(); setError(""); setSubmitting(true);
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
          upiId: form.upiId, paymentName: form.paymentName,
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

  async function toggleBot(p: Property) {
    const newVal = !(p as any).bot_enabled;
    await fetch(`/api/properties/${p.id}/bot-toggle`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_enabled: newVal }),
    });
    setSuccess(newVal ? "Bot activated! 🤖" : "Bot deactivated");
    fetchProperties();
    if (newVal) setBotLinkProp({ ...p, bot_enabled: newVal } as any);
  }

  function copyBotLink(propId: number) {
    navigator.clipboard.writeText(`${SITE_URL}/book/${propId}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const filtered = properties.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || (p as any).city?.toLowerCase().includes(search.toLowerCase()));
  const totalBeds = properties.reduce((s, p) => s + Number(p.total_beds || 0), 0);
  const occupied = properties.reduce((s, p) => s + Number((p as any).occupied_beds || 0), 0);

  return (
    <div className="space-y-6 pb-8">
      <ConfirmModal isOpen={confirmOpen} title="Delete Property" message="Are you sure you want to delete this property?" confirmLabel="Delete" onConfirm={doDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} />
      {success && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50">✓ {success}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your hotels, hostels, dorms, and guesthouses</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 px-3 py-2 text-sm">
          <span className="text-lg">+</span> Add Property
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {([
          { label: "Total Properties", value: properties.length, sub: "Active properties", iconBg: "bg-orange-100", dot: "bg-orange-400" },
          { label: "Total Beds", value: totalBeds, sub: "Across all properties", iconBg: "bg-violet-100", dot: "bg-violet-400" },
          { label: "Occupied Beds", value: occupied, sub: `${totalBeds > 0 ? Math.round((occupied/totalBeds)*100) : 0}% Occupied`, iconBg: "bg-red-100", dot: "bg-red-400" },
        ] as any[]).map(({ label, value, sub, iconBg, dot }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center`}><div className={`w-4 h-4 rounded-full ${dot}`} /></div>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1.5">{value}</p>
            <div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${dot}`} /><p className="text-xs text-slate-400">{sub}</p></div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties..." className="input-field w-full max-w-xs text-sm" />

      {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> : filtered.length === 0 ? <div className="text-center py-12 text-slate-400">No properties found</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const icon = TYPE_ICONS[p.type] || TYPE_ICONS.default;
            const bg = TYPE_BG[p.type] || TYPE_BG.default;
            const totalB = Number(p.total_beds || 0);
            const occB = Number((p as any).occupied_beds || 0);
            const availB = totalB - occB;
            const occ = totalB > 0 ? Math.round(occB / totalB * 100) : 0;
            const botEnabled = (p as any).bot_enabled;
            const hasUpi = !!(p as any).upi_id;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className={`h-36 bg-gradient-to-br ${bg} flex items-center justify-center relative`}>
                  <span className="text-6xl">{icon}</span>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>● {p.status === "active" ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => openEdit(p)} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-orange-500 shadow-sm text-sm">✏️</button>
                    <button onClick={() => { setDeleteId(p.id); setConfirmOpen(true); }} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm text-sm">🗑</button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center flex-shrink-0`}><span className="text-xl">{icon}</span></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{p.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${hasUpi ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>{hasUpi ? "💳 UPI ✓" : "💳 No UPI"}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">📍 {(p as any).address}, {(p as any).city}, {(p as any).state}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Occupancy</span><span className={`font-semibold ${occ >= 80 ? "text-red-500" : occ >= 50 ? "text-amber-500" : "text-green-600"}`}>{occ}%</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${occ >= 80 ? "bg-red-400" : occ >= 50 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${occ}%` }} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ label: "Total", value: totalB }, { label: "Occupied", value: occB, red: true }, { label: "Available", value: availB, green: true }].map(s => (
                      <div key={s.label} className={`rounded-xl p-2 text-center ${s.red ? "bg-red-50" : s.green ? "bg-green-50" : "bg-slate-50"}`}>
                        <div className={`text-lg font-bold ${s.red ? "text-red-500" : s.green ? "text-green-600" : "text-slate-700"}`}>{s.value}</div>
                        <div className="text-xs text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mb-3">
                    <span className="capitalize">🏷️ {p.type}</span>
                    <span>🕐 {(p as any).check_in_time || "14:00"} – {(p as any).check_out_time || "11:00"}</span>
                  </div>
                  <div className={`rounded-xl p-3 border ${botEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🤖</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Booking Bot</p>
                          <p className={`text-[10px] font-semibold ${botEnabled ? "text-emerald-600" : "text-slate-400"}`}>{botEnabled ? "● Active" : "○ Inactive"}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleBot(p)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${botEnabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${botEnabled ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {botEnabled && (
                      <div className="mt-2">
                        <p className="text-[10px] text-slate-500 mb-1.5">Share with guests:</p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 overflow-hidden">
                            <p className="text-[10px] text-slate-600 font-mono truncate">{SITE_URL}/book/{p.id}</p>
                          </div>
                          <button onClick={() => copyBotLink(p.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg">{copied ? "✓" : "📋"}</button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{editingProperty ? "Edit Property" : "Add Property"}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1.5">Property Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sunset Hostel" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Type *</label><select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field w-full text-sm"><option value="hostel">Hostel</option><option value="hotel">Hotel</option><option value="guesthouse">Guesthouse</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Beds *</label><input required type="number" min={1} value={form.totalBeds} onChange={e => setForm(f => ({ ...f, totalBeds: e.target.value }))} placeholder="50" className="input-field w-full text-sm" /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1.5">Address *</label><input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">City *</label><input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Jaipur" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label><select required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field w-full text-sm">{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Pincode</label><input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="302001" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Number</label><input value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} placeholder="" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-in Time</label><input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-out Time</label><input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Owner Name (UPI)</label><input value={form.paymentName} onChange={e => setForm(f => ({ ...f, paymentName: e.target.value }))} placeholder="e.g. Rajesh Kumar" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">UPI ID</label><input value={form.upiId} onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} placeholder="rajesh@upi" className="input-field w-full text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">{submitting ? "Saving..." : editingProperty ? "Update Property" : "Create Property"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {botLinkProp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-4">
              <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🤖</div>
              <h2 className="text-lg font-bold text-slate-800">Bot Activated!</h2>
              <p className="text-sm text-slate-500 mt-1">{(botLinkProp as any).name} — Guest bot is now live</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-2">Share this link with guests:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 overflow-hidden"><p className="text-xs text-slate-700 font-mono truncate">{SITE_URL}/book/{botLinkProp.id}</p></div>
                <button onClick={() => copyBotLink(botLinkProp.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg">{copied ? "✓ Copied!" : "📋 Copy"}</button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-blue-700 font-medium">💡 Bot will:</p>
              <ul className="text-xs text-blue-600 mt-1 space-y-0.5"><li>• Answer guest questions</li><li>• Share UPI ID for payment</li><li>• Collect UTR, sender name & date</li></ul>
            </div>
            <button onClick={() => setBotLinkProp(null)} className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}