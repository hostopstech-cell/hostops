"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

// ── Same types as bookings page ──
const BOOKING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const BOOKING_SOURCES = [
  { value: "direct", label: "Direct" },
  { value: "walk_in", label: "Walk-in" },
  { value: "airbnb", label: "Airbnb" },
  { value: "booking_com", label: "Booking.com" },
  { value: "goibibo", label: "Goibibo" },
  { value: "makemytrip", label: "MakeMyTrip" },
  { value: "hostelworld", label: "Hostelworld" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const ITEMS_PER_PAGE = 10;

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function capitalize(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return (name || "G").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    checked_in: { label: "Checked In", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    checked_out: { label: "Checked Out", cls: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-200" },
  };
  const { label, cls } = config[status] || config.pending;
  return <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

const emptyBookingForm = () => ({
  guestName: "", guestPhone: "", checkIn: "", checkOut: "",
  amount: "", discount: "0", paymentStatus: "pending",
  paymentMethod: "cash", bookingSource: "direct",
  numberOfGuests: "1", utrNumber: "", paymentSenderName: "",
  status: "confirmed",
});

export default function StaffPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  // Auth
  const [inputToken, setInputToken] = useState("");
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Data
  const [bookings, setBookings] = useState<any[]>([]);
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(false);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [success, setSuccess] = useState("");
  const [infoBooking, setInfoBooking] = useState<any>(null);

  // Add Booking
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyBookingForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchBookings(t: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, {
        headers: { "x-staff-token": t },
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings || []);
      setPropertyName(data.propertyName || "");
    } catch {}
    setLoading(false);
  }

  async function handleLogin() {
    if (!inputToken.trim()) return;
    setAuthLoading(true); setAuthError("");
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, {
        headers: { "x-staff-token": inputToken.trim() },
      });
      if (!res.ok) { setAuthError("Invalid access code. Check with your manager."); setAuthLoading(false); return; }
      const data = await res.json();
      setBookings(data.bookings || []);
      setPropertyName(data.propertyName || "");
      setToken(inputToken.trim());
      setAuthed(true);
    } catch { setAuthError("Something went wrong. Try again."); }
    setAuthLoading(false);
  }

  async function handleAddBooking() {
    if (!form.guestName.trim()) { setFormError("Guest name required"); return; }
    if (!form.guestPhone.trim()) { setFormError("Phone required"); return; }
    if (!form.checkIn) { setFormError("Check-in date required"); return; }
    if (!form.checkOut) { setFormError("Check-out date required"); return; }
    setSubmitting(true); setFormError("");
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-staff-token": token },
        body: JSON.stringify({
          guestName: form.guestName, guestPhone: form.guestPhone,
          checkIn: form.checkIn, checkOut: form.checkOut,
          amount: parseFloat(form.amount) || 0,
          paymentStatus: form.paymentStatus, paymentMethod: form.paymentMethod,
          utrNumber: form.utrNumber, paymentSenderName: form.paymentSenderName,
          numberOfGuests: parseInt(form.numberOfGuests) || 1,
          status: form.status, bookingSource: form.bookingSource,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); setSubmitting(false); return; }
      setSuccess("Booking added! #" + data.bookingCode);
      setShowAddModal(false);
      setForm(emptyBookingForm());
      fetchBookings(token);
      setTimeout(() => setSuccess(""), 3000);
    } catch { setFormError("Something went wrong."); }
    setSubmitting(false);
  }

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3500); return () => clearTimeout(t); }
  }, [success]);

  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns = bookings.filter(b => b.check_in?.slice(0, 10) === today).length;
  const todayCheckOuts = bookings.filter(b => b.check_out?.slice(0, 10) === today).length;
  const upcomingBookings = bookings.filter(b => b.check_in?.slice(0, 10) > today && b.status !== "cancelled").length;

  const filtered = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch = b.guest_name?.toLowerCase().includes(q) ||
      b.guest_phone?.includes(q) || b.booking_code?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Login Screen ──
  if (!authed) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🏨</div>
          <h1 className="text-xl font-bold text-slate-800">Staff Access</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your access code to continue</p>
        </div>
        <div className="space-y-4">
          <input type="password" value={inputToken} onChange={e => setInputToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter staff access code"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          {authError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{authError}</p>}
          <button onClick={handleLogin} disabled={authLoading || !inputToken.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 text-sm">
            {authLoading ? "Verifying..." : "Access Bookings"}
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-4">HostOps Staff Portal • Last 7 days</p>
      </div>
    </div>
  );

  // ── Main Bookings Page ──
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-emerald-700">✓ {success}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">H</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{propertyName}</p>
              <p className="text-xs text-slate-400">Staff View • Last 7 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full hidden sm:block">● Live</span>
            <button onClick={() => { setShowAddModal(true); setFormError(""); setForm(emptyBookingForm()); }}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
              + Add Booking
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-5">

        {/* Stats — same as bookings page */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: bookings.length, sub: "Last 7 days" },
            { label: "Today's Check-ins", value: todayCheckIns, sub: "Arriving today" },
            { label: "Today's Check-outs", value: todayCheckOuts, sub: "Departing today" },
            { label: "Upcoming", value: upcomingBookings, sub: "Future bookings" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input type="text" placeholder="Search guest, phone, booking ID..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-orange-400">
            <option value="all">All Status</option>
            {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {filtered.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium ml-auto">
              {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table — same as bookings page */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-lg font-bold text-slate-800 mb-1">No bookings found</p>
            <p className="text-sm text-slate-400">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : "No bookings in last 7 days."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Guest", "Property / Bed", "Check-in", "Check-out", "Amount", "Source", "Status", "Info"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map(b => {
                      const color = getAvatarColor(b.guest_name);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${color}`}>
                                {getInitials(b.guest_name)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{b.guest_name}</p>
                                <p className="text-xs text-slate-400">{b.guest_phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-800">{b.property_name || "—"}</p>
                            <p className="text-xs text-slate-400">{b.room_name || ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-700 font-medium whitespace-nowrap">{formatDate(b.check_in)}</p>
                            <p className="text-[11px] text-slate-400">{new Date(b.check_in).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-700 font-medium whitespace-nowrap">{formatDate(b.check_out)}</p>
                            <p className="text-[11px] text-slate-400">{new Date(b.check_out).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-slate-900">₹{Number(b.final_amount || b.amount || 0).toLocaleString("en-IN")}</p>
                            <p className={`text-[11px] font-semibold ${b.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                              {capitalize(b.payment_status)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                            {b.booking_source?.replace(/_/g, " ") || "direct"}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-4 py-3">
                            <button onClick={() => setInfoBooking(b)}
                              className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all"
                              title="View Payment Info">
                              👁
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 transition-all">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${currentPage === p ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 transition-all">›</button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-slate-400 text-center pb-4">HostOps Staff Portal • Last 7 days only</p>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-800">Add New Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guest Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Name *</label>
                    <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
                    <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">No. of Guests</label>
                    <input type="number" min="1" value={form.numberOfGuests} onChange={e => setForm(f => ({ ...f, numberOfGuests: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stay Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Check-in *</label>
                    <input type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Check-out *</label>
                    <input type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Source</label>
                    <select value={form.bookingSource} onChange={e => setForm(f => ({ ...f, bookingSource: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                      {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Status</label>
                    <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">UTR Number</label>
                    <input value={form.utrNumber} onChange={e => setForm(f => ({ ...f, utrNumber: e.target.value }))}
                      placeholder="UTR123456"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sender Name</label>
                    <input value={form.paymentSenderName} onChange={e => setForm(f => ({ ...f, paymentSenderName: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                </div>
              </div>
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={handleAddBooking} disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
                  {submitting ? "Adding..." : "Add Booking"}
                </button>
                <button onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Info Modal — same as bookings page */}
      {infoBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Info</h2>
                <p className="text-sm text-slate-500">{infoBooking.guest_name} — {infoBooking.booking_code}</p>
              </div>
              <button onClick={() => setInfoBooking(null)}
                className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Amount", value: `₹${Number(infoBooking.final_amount || infoBooking.amount || 0).toLocaleString("en-IN")}` },
                { label: "Status", value: capitalize(infoBooking.payment_status), colored: true },
                { label: "Method", value: capitalize(infoBooking.payment_method) || "—" },
                { label: "Sender", value: infoBooking.payment_sender_name || "—" },
                { label: "UTR", value: infoBooking.utr_number || "—" },
                { label: "Pay Date", value: infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "—" },
                { label: "Check-in", value: formatDate(infoBooking.check_in) },
                { label: "Check-out", value: formatDate(infoBooking.check_out) },
                { label: "Booking ID", value: "#" + infoBooking.booking_code },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${item.colored ? (infoBooking.payment_status === "paid" ? "text-emerald-600" : "text-amber-600") : "text-slate-900"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
