"use client";

import { useEffect, useState } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Guest, IDType } from "@/types";
import {
  Search, User, Phone, MapPin, Calendar, Repeat,
  Edit, Trash2, Download, ChevronLeft, ChevronRight,
  Home, CreditCard, Clock, Users
} from "lucide-react";

const ID_TYPES: { value: IDType; label: string }[] = [
  { value: "aadhar", label: "Aadhar" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

type TabFilter = "all" | "checked_in" | "checked_out" | "confirmed" | "repeat";

interface GuestWithBooking extends Guest {
  latest_booking_id?: number;
  booking_code?: string;
  check_in?: string;
  check_out?: string;
  final_amount?: number;
  booking_status?: string;
  booking_source?: string;
  property_name?: string;
  room_name?: string;
}

interface Stats {
  totalGuests: number;
  currentlyStaying: number;
  repeatGuests: number;
  upcomingCheckins: number;
}

const STATUS_STYLES: Record<string, string> = {
  checked_in: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  checked_out: "bg-slate-100 text-slate-600 border border-slate-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  cancelled: "bg-red-100 text-red-600 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  checked_in: "Checked In",
  checked_out: "Checked Out",
  confirmed: "Upcoming",
  pending: "Pending",
  cancelled: "Cancelled",
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  walk_in: "Walk In",
  airbnb: "Airbnb",
  booking_com: "Booking.com",
  goibibo: "Goibibo",
  makemytrip: "MakeMyTrip",
  hostelworld: "Hostelworld",
  other: "Other",
};

const ITEMS_PER_PAGE = 10;

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestWithBooking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0,
    currentlyStaying: 0,
    repeatGuests: 0,
    upcomingCheckins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestWithBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    country: "India",
    address: "",
    idType: "" as IDType | "",
    idNumber: "",
    notes: "",
  });

  async function fetchGuests() {
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      if (res.ok) {
        setGuests(data.guests);
        if (data.stats) setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGuests();
  }, []);

  function handleEdit(guest: GuestWithBooking) {
    setEditingGuest(guest);
    setForm({
      name: guest.name,
      phone: guest.phone,
      email: guest.email || "",
      country: guest.country,
      address: guest.address || "",
      idType: guest.id_type || "",
      idNumber: guest.id_number || "",
      notes: guest.notes || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingGuest(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      country: "India",
      address: "",
      idType: "",
      idNumber: "",
      notes: "",
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this guest?")) return;
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Guest deleted successfully!");
        await fetchGuests();
      } else {
        setError("Failed to delete guest");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const url = editingGuest ? `/api/guests/${editingGuest.id}` : "/api/guests";
      const method = editingGuest ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save guest");
        return;
      }
      setSuccess(editingGuest ? "Guest updated successfully!" : "Guest created successfully!");
      handleCancel();
      await fetchGuests();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleExport() {
    const headers = ["Name", "Phone", "Email", "Country", "ID Type", "ID Number", "Total Stays", "Total Spent", "Last Visit"];
    const rows = filteredGuests.map((g) => [
      g.name, g.phone, g.email || "", g.country,
      g.id_type || "", g.id_number || "",
      g.total_stays, g.total_spent, g.last_visit || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredGuests = guests?.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.booking_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "repeat" && guest.total_stays > 1) ||
      (activeTab === "checked_in" && guest.booking_status === "checked_in") ||
      (activeTab === "checked_out" && guest.booking_status === "checked_out") ||
      (activeTab === "confirmed" && guest.booking_status === "confirmed");

    return matchesSearch && matchesTab;
  }) ?? [];

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / ITEMS_PER_PAGE));
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabs: { key: TabFilter; label: string; dot?: string }[] = [
    { key: "all", label: "All" },
    { key: "checked_in", label: "Checked In", dot: "bg-emerald-500" },
    { key: "checked_out", label: "Checked Out", dot: "bg-slate-400" },
    { key: "confirmed", label: "Upcoming", dot: "bg-blue-500" },
    { key: "repeat", label: "Repeat Guests", dot: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Guests</h1>
          <p className="mt-1 text-slate-600">Manage guest information and history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => { handleCancel(); setShowForm(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <User size={16} />
            Add Guest
          </button>
        </div>
      </div>

      {success && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Guests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalGuests}</p>
              <p className="text-xs text-slate-400">All time</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Home size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Currently Staying</p>
              <p className="text-2xl font-bold text-slate-900">{stats.currentlyStaying}</p>
              <p className="text-xs text-slate-400">Checked in now</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Repeat size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Repeat Guests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.repeatGuests}</p>
              <p className="text-xs text-slate-400">Visited more than once</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Upcoming Check-ins</p>
              <p className="text-2xl font-bold text-slate-900">{stats.upcomingCheckins}</p>
              <p className="text-xs text-slate-400">Next 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email or booking ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Guest Form */}
      {showForm && (
        <div className="card-premium p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingGuest ? "Edit Guest" : "New Guest"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone *</label>
              <input type="tel" required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="john@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Country</label>
              <input type="text" value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input-field" placeholder="India" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
              <textarea value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field" rows={2} placeholder="Full address..." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">ID Type</label>
              <select value={form.idType}
                onChange={(e) => setForm({ ...form, idType: e.target.value as IDType | "" })}
                className="input-field">
                <option value="">Select ID Type</option>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">ID Number</label>
              <input type="text" value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                className="input-field" placeholder="ID number" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field" rows={2} placeholder="Additional notes..." />
            </div>
            {error && (
              <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? "Saving..." : editingGuest ? "Update Guest" : "Save Guest"}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs + Table */}
      <div className="card overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.dot && (
                <span className={`h-2 w-2 rounded-full ${tab.dot}`} />
              )}
              {tab.label}
              {tab.key === "all" && (
                <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">
                  {guests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading guests...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-orange-50 to-white">
            <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">No guests found</p>
            <p className="text-slate-600 mb-6">
              {searchTerm || activeTab !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first guest to get started."}
            </p>
            {activeTab === "all" && !searchTerm && (
              <button
                onClick={() => { handleCancel(); setShowForm(true); }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <User size={18} />
                Add Guest
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-5 py-3 text-left">Guest</th>
                    <th className="px-5 py-3 text-left">Contact</th>
                    <th className="px-5 py-3 text-left">Booking ID</th>
                    <th className="px-5 py-3 text-left">Property / Room</th>
                    <th className="px-5 py-3 text-left">Check-in / Check-out</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGuests.map((guest) => (
                    <tr key={guest.id} className="table-row">
                      {/* Guest */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm flex-shrink-0">
                            {guest.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900">{guest.name}</p>
                              {guest.total_stays > 1 && (
                                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
                                  <Repeat size={9} />
                                  Repeat
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {guest.total_stays} stay{guest.total_stays !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={13} />
                          <span>{guest.phone}</span>
                        </div>
                        {guest.email && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{guest.email}</p>
                        )}
                      </td>

                      {/* Booking ID */}
                      <td className="px-5 py-3">
                        {guest.booking_code ? (
                          <div>
                            <p className="font-mono text-sm font-semibold text-slate-800">{guest.booking_code}</p>
                            {guest.booking_source && (
                              <p className="text-xs text-slate-400 mt-0.5">{SOURCE_LABELS[guest.booking_source] ?? guest.booking_source}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Property / Room */}
                      <td className="px-5 py-3">
                        {guest.property_name ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Home size={13} />
                              <span className="font-medium">{guest.property_name}</span>
                            </div>
                            {guest.room_name && (
                              <p className="text-xs text-slate-400 mt-0.5 ml-4">{guest.room_name}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={13} />
                            <span>{guest.country}</span>
                          </div>
                        )}
                      </td>

                      {/* Check-in / Check-out */}
                      <td className="px-5 py-3">
                        {guest.check_in ? (
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Calendar size={11} className="text-emerald-500" />
                              <span>{formatDate(guest.check_in)}</span>
                            </div>
                            {guest.check_out && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Calendar size={11} className="text-red-400" />
                                <span>{formatDate(guest.check_out)}</span>
                              </div>
                            )}
                          </div>
                        ) : guest.last_visit ? (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Clock size={12} />
                            <span>Last: {formatDate(guest.last_visit)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3">
                        {guest.final_amount != null ? (
                          <div>
                            <p className="font-semibold text-slate-900">₹{guest.final_amount.toLocaleString("en-IN")}</p>
                            <p className="text-xs text-slate-400">₹{(guest.total_spent ?? 0).toLocaleString("en-IN")} total</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-slate-400 text-xs">₹{(guest.total_spent ?? 0).toLocaleString("en-IN")} total</p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        {guest.booking_status ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[guest.booking_status] ?? "bg-slate-100 text-slate-600"}`}>
                            {STATUS_LABELS[guest.booking_status] ?? capitalize(guest.booking_status)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(guest)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredGuests.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)} of {filteredGuests.length} guests
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    page = currentPage - 2 + i;
                  }
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
