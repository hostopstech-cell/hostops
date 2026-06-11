"use client";
import ConfirmModal from '@/components/ConfirmModal';
import { useEffect, useState } from "react";
import type { Property } from "@/types";
import {
  Plus, Search, Building2, BedDouble, TrendingUp, Users,
  Copy, Check, ExternalLink, Settings, Calendar,
  ChevronRight, Wallet, Shield, Eye
} from "lucide-react";

const TYPE_ICONS: Record<string, string> = { hostel: "🏨", hotel: "🏩", guesthouse: "🏡", dorm: "🛏️", default: "🏠" };
const TYPE_BG: Record<string, string> = {
  hostel: "from-orange-50 to-orange-100",
  hotel: "from-blue-50 to-blue-100",
  guesthouse: "from-green-50 to-green-100",
  dorm: "from-purple-50 to-purple-100",
  default: "from-slate-50 to-slate-100"
};
const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"];
const emptyForm = () => ({ name: "", type: "hostel", address: "", city: "", state: "Rajasthan", pincode: "", contactNumber: "", email: "", totalBeds: "", description: "", checkInTime: "14:00", checkOutTime: "11:00", upiId: "", paymentName: "", status: "active", amenities: [] as string[] });
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://hostops-six.vercel.app";

type SortType = "revenue" | "occupancy" | "name";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("revenue");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [botLinkProp, setBotLinkProp] = useState<Property | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [staffLinkProp, setStaffLinkProp] = useState<Property | null>(null);

  async function fetchData() {
    const [propsRes, bookingsRes] = await Promise.all([
      fetch("/api/properties"),
      fetch("/api/bookings"),
    ]);
    const propsData = await propsRes.json();
    const bookingsData = await bookingsRes.json();
    setProperties(propsData.properties || []);
    setAllBookings(bookingsData.bookings || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  // ── Computed Stats ──
  const thisMonth = new Date().toISOString().slice(0, 7);
  const totalBeds = properties.reduce((s, p) => s + Number(p.total_beds || 0), 0);
  const occupied = properties.reduce((s, p) => s + Number((p as any).occupied_beds || 0), 0);
  const activeProps = properties.filter(p => p.status === "active").length;
  const monthRevenue = allBookings
    .filter(b => b.check_in?.toString().startsWith(thisMonth) && b.status !== 'cancelled')
    .reduce((s, b) => s + Number(b.final_amount || 0), 0);
  const avgOccupancy = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  // Per-property stats
  function getPropStats(p: Property) {
    const propBookings = allBookings.filter(b =>
      String(b.property_id) === String(p.id) &&
      b.check_in?.toString().startsWith(thisMonth) &&
      b.status !== 'cancelled'
    );
    const income = propBookings.reduce((s, b) => s + Number(b.final_amount || 0), 0);
    const totalB = Number(p.total_beds || 0);
    const occB = Number((p as any).occupied_beds || 0);
    const occ = totalB > 0 ? Math.round((occB / totalB) * 100) : 0;
    return { income, occ, occB, availB: totalB - occB }
  }

  // Staff link generator — encoded token, no DB needed
  function getStaffLink(p: Property) {
    const token = btoa(`${p.id}:staff:${(p as any).owner_id || 'owner'}`)
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${SITE_URL}/staff/${p.id}?token=${token}`;
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

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
    if (res.ok) { setSuccess("Property deleted!"); fetchData(); }
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
      setShowModal(false); fetchData();
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
    fetchData();
    if (newVal) setBotLinkProp({ ...p, bot_enabled: newVal } as any);
  }

  // Filter + Sort
  const filtered = properties
    .filter(p => !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p as any).city?.toLowerCase().includes(search.toLowerCase())
    )
    .map(p => ({ ...p, _stats: getPropStats(p) }))
    .sort((a, b) => {
      if (sortBy === "revenue") return b._stats.income - a._stats.income;
      if (sortBy === "occupancy") return b._stats.occ - a._stats.occ;
      return a.name.localeCompare(b.name);
    });

  // Performance table data
  const perfData = properties
    .map(p => ({ ...p, _stats: getPropStats(p) }))
    .sort((a, b) => b._stats.income - a._stats.income);

  return (
    <div className="space-y-6 pb-8">
      <ConfirmModal isOpen={confirmOpen} title="Delete Property" message="Are you sure you want to delete this property?" confirmLabel="Delete" onConfirm={doDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} />

      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <Check size={15} /> {success}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all your properties</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Properties", value: properties.length,
            sub: "Active properties", icon: <Building2 size={18} className="text-orange-600" />,
            iconBg: "bg-orange-100", trend: null
          },
          {
            label: "Active Properties", value: activeProps,
            sub: `${properties.length > 0 ? Math.round((activeProps/properties.length)*100) : 0}% of total`,
            icon: <Check size={18} className="text-emerald-600" />,
            iconBg: "bg-emerald-100", trend: null
          },
          {
            label: "Total Monthly Revenue",
            value: `₹${monthRevenue.toLocaleString('en-IN')}`,
            sub: "This month's bookings",
            icon: <Wallet size={18} className="text-violet-600" />,
            iconBg: "bg-violet-100",
            trend: <TrendingUp size={11} className="text-emerald-500" />
          },
          {
            label: "Average Occupancy", value: `${avgOccupancy}%`,
            sub: `${occupied} of ${totalBeds} beds`,
            icon: <Users size={18} className="text-blue-600" />,
            iconBg: "bg-blue-100",
            trend: avgOccupancy < 30 ? <TrendingUp size={11} className="text-red-400" /> : <TrendingUp size={11} className="text-emerald-500" />
          },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              {card.trend && <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">{card.trend}</div>}
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search property by name or location..."
            className="input-field w-full pl-9 text-sm" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
          className="input-field text-sm w-auto">
          <option value="revenue">Sort: Revenue (High to Low)</option>
          <option value="occupancy">Sort: Occupancy (High to Low)</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading properties...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No properties found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => {
            const icon = TYPE_ICONS[p.type] || TYPE_ICONS.default;
            const bg = TYPE_BG[p.type] || TYPE_BG.default;
            const { income, occ, occB, availB } = p._stats;
            const totalB = Number(p.total_beds || 0);
            const botEnabled = (p as any).bot_enabled;
            const hasUpi = !!(p as any).upi_id;
            const isHighest = filtered[0]?.id === p.id && sortBy === "revenue";
            const isHighestOcc = filtered[0]?.id === p.id && sortBy === "occupancy";

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                {/* Card Header Image */}
                <div className={`h-32 bg-gradient-to-br ${bg} flex items-center justify-center relative`}>
                  <span className="text-5xl">{icon}</span>
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-500 text-white" : "bg-red-100 text-red-600"}`}>
                      ● {p.status === "active" ? "Active" : "Inactive"}
                    </span>
                    {isHighest && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500 text-white">🏆 Top Revenue</span>}
                    {isHighestOcc && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-violet-500 text-white">🏆 Top Occupancy</span>}
                  </div>
                  {/* Edit/Delete */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => openEdit(p)} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-orange-500 shadow-sm text-sm transition-colors">✏️</button>
                    <button onClick={() => { setDeleteId(p.id); setConfirmOpen(true); }} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm text-sm transition-colors">🗑</button>
                  </div>
                </div>

                <div className="p-5">
                  {/* Property Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{p.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{p.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${hasUpi ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      💳 UPI {hasUpi ? "✓" : "✗"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">📍 {(p as any).address}, {(p as any).city}, {(p as any).state}</p>

                  {/* This Month Revenue */}
                  <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">This Month Revenue</p>
                      <p className="text-base font-bold text-slate-900">₹{income.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Occupancy</p>
                      <p className={`text-base font-bold ${occ >= 80 ? "text-red-500" : occ >= 50 ? "text-amber-500" : "text-emerald-600"}`}>{occ}%</p>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-full rounded-full transition-all ${occ >= 80 ? "bg-red-400" : occ >= 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${occ}%` }} />
                    </div>
                  </div>

                  {/* Bed Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Total", value: totalB, cls: "bg-slate-50 text-slate-700" },
                      { label: "Occupied", value: occB, cls: "bg-red-50 text-red-500" },
                      { label: "Available", value: availB, cls: "bg-green-50 text-green-600" }
                    ].map(s => (
                      <div key={s.label} className={`${s.cls.split(' ')[0]} rounded-xl p-2 text-center`}>
                        <div className={`text-lg font-bold ${s.cls.split(' ')[1]}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Check-in/out times */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mb-3">
                    <span className="capitalize">🏷️ {p.type}</span>
                    <span>🕐 {(p as any).check_in_time || "14:00"} – {(p as any).check_out_time || "11:00"}</span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => window.location.href = `/dashboard/bookings`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
                    >
                      <Eye size={13} /> View Property
                    </button>
                    <button
                      onClick={() => window.location.href = `/dashboard/rooms`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-orange-200 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-all"
                    >
                      <BedDouble size={13} /> Manage Rooms
                    </button>
                  </div>

                  {/* Staff Access Button */}
                  <button
                    onClick={() => setStaffLinkProp(p)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold mb-3 transition-all"
                  >
                    <Shield size={13} /> Staff Access Link
                  </button>

                  {/* Booking Bot */}
                  <div className={`rounded-xl p-3 border ${botEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between mb-2">
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
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${botEnabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${botEnabled ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {botEnabled && (
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1.5">Share with guests:</p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 overflow-hidden">
                            <p className="text-[10px] text-slate-600 font-mono truncate">{SITE_URL}/book/{p.id}</p>
                          </div>
                          <button onClick={() => copyText(`${SITE_URL}/book/${p.id}`, `bot-${p.id}`)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg transition-colors">
                            {copied === `bot-${p.id}` ? <Check size={12} /> : <Copy size={12} />}
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

      {/* Property Performance Overview Table */}
      {perfData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Property Performance Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by this month's revenue</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">This Month</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Rank", "Property", "Location", "Revenue (This Month)", "Occupancy", "Total Beds", "Occupied", "Available"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {perfData.map((p, i) => {
                  const { income, occ, occB, availB } = p._stats;
                  const totalB = Number(p.total_beds || 0);
                  const rankColors = ['bg-orange-500 text-white', 'bg-slate-400 text-white', 'bg-amber-600 text-white', 'bg-slate-200 text-slate-600', 'bg-slate-100 text-slate-500'];
                  const icon = TYPE_ICONS[p.type] || TYPE_ICONS.default;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`w-7 h-7 rounded-full ${rankColors[i] || 'bg-slate-100 text-slate-500'} flex items-center justify-center`}>
                          <span className="text-xs font-bold">{i + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {(p as any).city}, {(p as any).state}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">₹{income.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${occ >= 80 ? "bg-red-400" : occ >= 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                              style={{ width: `${occ}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${occ >= 80 ? "text-red-500" : occ >= 50 ? "text-amber-500" : "text-emerald-600"}`}>{occ}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">{totalB}</td>
                      <td className="px-4 py-3 text-sm text-red-500 font-semibold">{occB}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">{availB}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Staff Access Modal ── */}
      {staffLinkProp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-5">
              <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Staff Access Link</h2>
              <p className="text-sm text-slate-500 mt-1">{(staffLinkProp as any).name}</p>
            </div>

            {/* Staff Link */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">🔗 Staff Portal Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 overflow-hidden">
                  <p className="text-[11px] text-slate-700 font-mono truncate">{getStaffLink(staffLinkProp)}</p>
                </div>
                <button onClick={() => copyText(getStaffLink(staffLinkProp), 'staff')}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors">
                  {copied === 'staff' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>

            {/* What Staff Can See */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-bold text-emerald-700 mb-2">✅ Staff Can Access</p>
                <ul className="space-y-1 text-xs text-emerald-600">
                  <li>• View bookings</li>
                  <li>• Add new bookings</li>
                  <li>• Check-in / Check-out</li>
                  <li>• Guest details</li>
                  <li>• Room availability</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700 mb-2">🚫 Staff Cannot See</p>
                <ul className="space-y-1 text-xs text-red-500">
                  <li>• Revenue & Finance</li>
                  <li>• Payment details</li>
                  <li>• Settings</li>
                  <li>• Other properties</li>
                  <li>• Owner dashboard</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-amber-700">
                <strong>⚠️ Note:</strong> This link gives limited access to <strong>{(staffLinkProp as any).name}</strong> only. Share it with your trusted staff members. Staff portal page coming soon — link is ready to share!
              </p>
            </div>

            <button onClick={() => setStaffLinkProp(null)}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Bot Activated Modal ── */}
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
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 overflow-hidden">
                  <p className="text-xs text-slate-700 font-mono truncate">{SITE_URL}/book/{botLinkProp.id}</p>
                </div>
                <button onClick={() => copyText(`${SITE_URL}/book/${botLinkProp.id}`, 'bot-modal')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                  {copied === 'bot-modal' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-blue-700 font-medium">💡 Bot will:</p>
              <ul className="text-xs text-blue-600 mt-1 space-y-0.5">
                <li>• Answer guest questions</li>
                <li>• Share UPI ID for payment</li>
                <li>• Collect UTR, sender name & date</li>
              </ul>
            </div>
            <button onClick={() => setBotLinkProp(null)} className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold">Done</button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Property Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{editingProperty ? "Edit Property" : "Add Property"}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sunset Hostel" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type *</label>
                  <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field w-full text-sm">
                    <option value="hostel">Hostel</option>
                    <option value="hotel">Hotel</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="dorm">Dorm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Beds *</label>
                  <input required type="number" min={1} value={form.totalBeds} onChange={e => setForm(f => ({ ...f, totalBeds: e.target.value }))} placeholder="50" className="input-field w-full text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address *</label>
                  <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">City *</label>
                  <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Jaipur" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label>
                  <select required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field w-full text-sm">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="302001" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Number</label>
                  <input value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} placeholder="9876543210" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-in Time</label>
                  <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-out Time</label>
                  <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Owner Name (UPI)</label>
                  <input value={form.paymentName} onChange={e => setForm(f => ({ ...f, paymentName: e.target.value }))} placeholder="e.g. Rajesh Kumar" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">UPI ID</label>
                  <input value={form.upiId} onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} placeholder="rajesh@upi" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
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
    </div>
  );
}
