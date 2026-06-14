"use client";
import { getCountryConfig } from "@/lib/country-config";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BOOKING_STATUSES = [
  { value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" }, { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];
const BOOKING_SOURCES = [
  { value: "direct", label: "Direct" }, { value: "walk_in", label: "Walk-in" },
  { value: "airbnb", label: "Airbnb" }, { value: "booking_com", label: "Booking.com" },
  { value: "goibibo", label: "Goibibo" }, { value: "makemytrip", label: "MakeMyTrip" },
  { value: "hostelworld", label: "Hostelworld" }, { value: "other", label: "Other" },
];
const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" }, { value: "cash", label: "Cash" },
  { value: "card", label: "Card" }, { value: "bank_transfer", label: "Bank Transfer" },
];
const ID_PROOF_TYPES = [
  { value: "aadhar", label: "Aadhar Card" }, { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" }, { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];
const ITEMS_PER_PAGE = 10;

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
const AVATAR_COLORS = ["bg-orange-100 text-orange-600","bg-blue-100 text-blue-600","bg-emerald-100 text-emerald-600","bg-violet-100 text-violet-600","bg-pink-100 text-pink-600"];
function getAvatarColor(name: string) { return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return (name || "G").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(); }

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

interface GuestDetail { name: string; phone: string; idProofType: string; idProofNumber: string; }
function makeGuest(): GuestDetail { return { name: "", phone: "", idProofType: "passport", idProofNumber: "" }; }

function parseAllGuests(booking: any): GuestDetail[] {
  const primary: GuestDetail = { name: booking.guest_name || "", phone: booking.guest_phone || "", idProofType: booking.id_proof_type || "aadhar", idProofNumber: booking.id_proof_number || "" };
  const additional: GuestDetail[] = [];
  try {
    const gd = booking.guests_data;
    if (gd) {
      const parsed = typeof gd === "string" ? JSON.parse(gd) : gd;
      if (Array.isArray(parsed)) parsed.forEach((g: any) => additional.push({ name: g.name || "", phone: g.phone || "", idProofType: g.idProofType || "aadhar", idProofNumber: g.idProofNumber || "" }));
    }
  } catch {}
  return [primary, ...additional];
}

const emptyForm = () => ({ checkIn: "", checkOut: "", amount: "", paymentStatus: "pending", paymentMethod: "cash", bookingSource: "walk_in", numberOfGuests: "1", utrNumber: "", paymentSenderName: "", status: "confirmed", roomId: "" });
const INPUT = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white";
const SELECT = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white";


function GuestCell({ booking }: { booking: any }) {
  const allGuests = parseAllGuests(booking);
  const color = getAvatarColor(booking.guest_name || "G");
  if (booking.number_of_guests <= 1 || allGuests.length <= 1) return (
    <div className="flex items-center gap-2.5">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${color}`}>{getInitials(booking.guest_name)}</div>
      <div><p className="font-semibold text-slate-900 text-sm">{booking.guest_name}</p><p className="text-xs text-slate-400">{booking.guest_phone}</p></div>
    </div>
  );
  return (
    <div className="flex flex-col gap-1">
      {allGuests.map((g: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${getAvatarColor(g.name || "G")}`}>{getInitials(g.name || "G")}</div>
          <div><p className="text-xs font-semibold text-slate-900">{g.name || "—"}</p><p className="text-[11px] text-slate-400">{g.phone || ""}</p></div>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [inputToken, setInputToken] = useState("");
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [ownerDialCode, setOwnerDialCode] = useState<string | null>(null);
  const _cfg = getCountryConfig(ownerDialCode);
  const sym = _cfg.currencySymbol;
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [infoBooking, setInfoBooking] = useState<any>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [guests, setGuests] = useState<GuestDetail[]>([makeGuest()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [editGuests, setEditGuests] = useState<GuestDetail[]>([makeGuest()]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const n = Math.max(1, parseInt(form.numberOfGuests) || 1);
    setGuests(prev => prev.length < n ? [...prev, ...Array.from({ length: n - prev.length }, makeGuest)] : prev.slice(0, n));
  }, [form.numberOfGuests]);

  useEffect(() => {
    if (!showEditModal) return;
    const n = Math.max(1, parseInt(editForm.numberOfGuests) || 1);
    setEditGuests(prev => prev.length < n ? [...prev, ...Array.from({ length: n - prev.length }, makeGuest)] : prev.slice(0, n));
  }, [editForm.numberOfGuests]); // eslint-disable-line

  function updateGuest(i: number, f: keyof GuestDetail, v: string) { setGuests(prev => prev.map((g, idx) => idx === i ? { ...g, [f]: v } : g)); }
  function updateEditGuest(i: number, f: keyof GuestDetail, v: string) { setEditGuests(prev => prev.map((g, idx) => idx === i ? { ...g, [f]: v } : g)); }

  async function fetchBookings(t: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, { headers: { "x-staff-token": t } });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings || []);
      setRooms(data.rooms || []);
      setPropertyName(data.propertyName || "");
    } catch {}
    setLoading(false);
  }

  async function handleLogin() {
    if (!inputToken.trim()) return;
    setAuthLoading(true); setAuthError("");
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, { headers: { "x-staff-token": inputToken.trim() } });
      if (!res.ok) { setAuthError("Invalid access code. Check with your manager."); setAuthLoading(false); return; }
      const data = await res.json();
      setBookings(data.bookings || []);
      setRooms(data.rooms || []);
      setPropertyName(data.propertyName || "");
      setToken(inputToken.trim());
      setAuthed(true);
    } catch { setAuthError("Something went wrong. Try again."); }
    setAuthLoading(false);
  }

  async function handleCheckIn(bookingId: number) {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-in`, { method: "POST" });
      if (res.ok) { setSuccess("Checked in successfully!"); fetchBookings(token); }
      else { const d = await res.json(); setSuccess("Error: " + (d.error || "Failed")); }
    } catch { setSuccess("Something went wrong."); }
    setActionLoading(null);
  }

  async function handleCheckOut(bookingId: number) {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-out`, { method: "POST" });
      if (res.ok) { setSuccess("Checked out successfully!"); fetchBookings(token); }
      else { const d = await res.json(); setSuccess("Error: " + (d.error || "Failed")); }
    } catch { setSuccess("Something went wrong."); }
    setActionLoading(null);
  }

  async function handleAddBooking() {
    const pg = guests[0];
    if (!pg.name.trim()) { setFormError("Primary guest name required"); return; }
    if (!/^\d{7,15}$/.test(pg.phone.trim())) { setFormError("Invalid phone number (7-15 digits)"); return; }
    if (!form.checkIn) { setFormError("Check-in date required"); return; }
    if (!form.checkOut) { setFormError("Check-out date required"); return; }
    if (form.checkIn >= form.checkOut) { setFormError("Check-out must be after check-in"); return; }
    if (pg.idProofNumber) {
      const id = pg.idProofNumber.trim().toUpperCase();
      const _proof = _cfg.idProofTypes.find((p: any) => p.value === pg.idProofType);
        if (_proof?.validate) { const _err = _proof.validate(id); if (_err) { setFormError(_err); return; } }
    }
    if (form.utrNumber && !/^\d{12}$/.test(form.utrNumber.trim())) { setFormError("UTR must be exactly 12 digits"); return; }
    setSubmitting(true); setFormError("");
    try {
      const res = await fetch(`/api/properties/${propertyId}/staff-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-staff-token": token },
        body: JSON.stringify({
          guestName: pg.name, guestPhone: pg.phone, idProofType: pg.idProofType, idProofNumber: pg.idProofNumber,
          checkIn: form.checkIn, checkOut: form.checkOut, amount: parseFloat(form.amount) || 0,
          paymentStatus: form.paymentStatus, paymentMethod: form.paymentMethod,
          utrNumber: form.utrNumber, paymentSenderName: form.paymentSenderName,
          numberOfGuests: parseInt(form.numberOfGuests) || 1, status: form.status,
          bookingSource: form.bookingSource, roomId: form.roomId || null,
          additionalGuests: guests.slice(1).map(g => ({ name: g.name, phone: g.phone, idProofType: g.idProofType, idProofNumber: g.idProofNumber })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); setSubmitting(false); return; }
      setSuccess("Booking added! #" + data.bookingCode);
      setShowAddModal(false); setForm(emptyForm()); setGuests([makeGuest()]);
      fetchBookings(token);
    } catch { setFormError("Something went wrong."); }
    setSubmitting(false);
  }

  function openEditModal(booking: any) {
    setEditingBooking(booking);
    const totalGuests = Math.max(1, booking.number_of_guests || 1);
    const parsedGuests = parseAllGuests(booking);
    while (parsedGuests.length < totalGuests) parsedGuests.push(makeGuest());
    setEditGuests(parsedGuests.slice(0, totalGuests));
    setEditForm({
      checkIn: booking.check_in?.slice(0, 10) || "", checkOut: booking.check_out?.slice(0, 10) || "",
      amount: String(booking.final_amount || booking.amount || ""), paymentStatus: booking.payment_status || "pending",
      paymentMethod: booking.payment_method || "cash", bookingSource: booking.booking_source || "direct",
      numberOfGuests: String(totalGuests), utrNumber: booking.utr_number || "",
      paymentSenderName: booking.payment_sender_name || "", status: booking.status || "confirmed",
      roomId: String(booking.room_id || ""),
    });
    setEditError("");
    setTimeout(() => setShowEditModal(true), 0);
  }

  async function handleEditBooking() {
    const pg = editGuests[0];
    if (!pg.name.trim()) { setEditError("Primary guest name required"); return; }
    if (!editForm.checkIn) { setEditError("Check-in date required"); return; }
    if (!editForm.checkOut) { setEditError("Check-out date required"); return; }
    setEditSubmitting(true); setEditError("");
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: pg.name, guestPhone: pg.phone, guestEmail: "",
          idProofType: pg.idProofType, idProofNumber: pg.idProofNumber,
          checkIn: editForm.checkIn, checkOut: editForm.checkOut,
          amount: parseFloat(editForm.amount) || 0, discount: editingBooking.discount || 0,
          paymentStatus: editForm.paymentStatus, paymentMethod: editForm.paymentMethod,
          bookingSource: editForm.bookingSource, numberOfGuests: parseInt(editForm.numberOfGuests) || 1,
          status: editForm.status, utrNumber: editForm.utrNumber, paymentSenderName: editForm.paymentSenderName,
          roomId: editForm.roomId || editingBooking.room_id || null,
          additionalGuests: editGuests.slice(1).map(g => ({ name: g.name, phone: g.phone, idProofType: g.idProofType, idProofNumber: g.idProofNumber })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "Failed to update"); setEditSubmitting(false); return; }
      setSuccess("Booking updated!"); setShowEditModal(false); fetchBookings(token);
    } catch { setEditError("Something went wrong."); }
    setEditSubmitting(false);
  }

  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3500); return () => clearTimeout(t); } }, [success]);

  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns = bookings.filter(b => b.check_in?.slice(0, 10) === today && b.status !== "cancelled").length;
  const todayCheckOuts = bookings.filter(b => b.check_out?.slice(0, 10) === today && b.status !== "cancelled").length;
  const currentlyIn = bookings.filter(b => b.status === "checked_in").length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r: any) => !bookings.some(b => b.room_id === r.id && ["confirmed","checked_in"].includes(b.status) && b.check_in?.slice(0,10) <= today && b.check_out?.slice(0,10) >= today)).length;

  const filtered = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    return (b.guest_name?.toLowerCase().includes(q) || b.guest_phone?.includes(q) || b.booking_code?.toLowerCase().includes(q)) &&
      (statusFilter === "all" || b.status === statusFilter);
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function getRoomName(roomId: any) {
    const r = rooms.find((r: any) => String(r.id) === String(roomId));
    return r ? r.name : null;
  }

  if (!authed) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🏨</div>
          <h1 className="text-xl font-bold text-slate-800">Staff Access</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your access code to continue</p>
        </div>
        <div className="space-y-4">
          <input type="password" value={inputToken} onChange={e => setInputToken(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter staff access code" className={INPUT} />
          {authError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{authError}</p>}
          <button onClick={handleLogin} disabled={authLoading || !inputToken.trim()} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 text-sm">
            {authLoading ? "Verifying..." : "Access Bookings"}
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-50">
      {success && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg border ${success.startsWith("Error") ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
          <p className={`text-sm font-semibold ${success.startsWith("Error") ? "text-red-700" : "text-emerald-700"}`}>{success.startsWith("Error") ? "⚠ " : "✓ "}{success}</p>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-orange-100 rounded-xl flex items-center justify-center text-lg">🏨</div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{propertyName || "Staff Portal"}</p>
            <p className="text-xs text-slate-400">Booking Management</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex gap-2 flex-wrap">
        <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search guest, room..." className="flex-1 min-w-[160px] border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
          <option value="all">All Status</option>
          {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading bookings...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No bookings found</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Guest", "Room", "Check-in → Check-out", "Nights", "Amount", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b: any) => {
                    const nights = Math.ceil((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000);
                    const roomName = getRoomName(b.room_id);
                    return (
                      <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3"><GuestCell booking={b} /></td>
                        <td className="px-4 py-3 text-slate-700 text-xs">{roomName || "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(b.check_in)} → {formatDate(b.check_out)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{nights}n</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">{sym}{Number(b.final_amount || b.amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-slate-400">{capitalize(b.payment_status || "")}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setInfoBooking(b)} className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">Info</button>
                            <button onClick={() => openEdit(b)} className="text-xs px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700">Edit</button>
                            {b.status === "confirmed" && (
                              <button onClick={() => handleAction(b.id, "check_in")} disabled={actionLoading === b.id} className="text-xs px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50">Check-in</button>
                            )}
                            {b.status === "checked_in" && (
                              <button onClick={() => handleAction(b.id, "check_out")} disabled={actionLoading === b.id} className="text-xs px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 disabled:opacity-50">Check-out</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">{filtered.length} bookings</p>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 text-xs rounded-lg border border-slate-200 disabled:opacity-40">←</button>
                  <span className="px-3 py-1 text-xs text-slate-600">{currentPage}/{totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 text-xs rounded-lg border border-slate-200 disabled:opacity-40">→</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {infoBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Booking Details</h2>
              <button onClick={() => setInfoBooking(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-slate-400">Guest</p><p className="font-semibold">{infoBooking.guest_name}</p></div>
                <div><p className="text-xs text-slate-400">Phone</p><p className="font-semibold">{infoBooking.guest_phone || "—"}</p></div>
                <div><p className="text-xs text-slate-400">Check-in</p><p className="font-semibold">{formatDate(infoBooking.check_in)}</p></div>
                <div><p className="text-xs text-slate-400">Check-out</p><p className="font-semibold">{formatDate(infoBooking.check_out)}</p></div>
                <div><p className="text-xs text-slate-400">Amount</p><p className="font-semibold">{sym}{Number(infoBooking.final_amount || infoBooking.amount || 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-slate-400">Status</p><StatusBadge status={infoBooking.status} /></div>
                <div><p className="text-xs text-slate-400">Source</p><p className="font-semibold">{capitalize(infoBooking.booking_source || "direct")}</p></div>
                <div><p className="text-xs text-slate-400">Payment</p><p className="font-semibold">{capitalize(infoBooking.payment_method || "")}</p></div>
              </div>
              {infoBooking.utr_number && <div><p className="text-xs text-slate-400">UTR</p><p className="font-mono text-xs">{infoBooking.utr_number}</p></div>}
              {infoBooking.id_proof_type && <div><p className="text-xs text-slate-400">ID Proof</p><p className="text-xs">{infoBooking.id_proof_type.toUpperCase()}: {infoBooking.id_proof_number}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-800">Add Booking</h2>
              <button onClick={() => { setShowAddModal(false); setForm(emptyForm()); setGuests([makeGuest()]); setFormError(""); }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-in *</label><input type="date" required value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className={INPUT} /></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-out *</label><input type="date" required value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className={INPUT} /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Room</label>
                <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className={SELECT}>
                  <option value="">No specific room</option>
                  {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type}) — {sym}{r.price_per_night}/night</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Guests</label><input type="number" min="1" max="20" value={form.numberOfGuests} onChange={e => setForm(f => ({ ...f, numberOfGuests: e.target.value }))} className={INPUT} /></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount ({sym})</label><input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className={INPUT} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Status</label>
                  <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))} className={SELECT}>
                    <option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className={SELECT}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Booking Source</label>
                <select value={form.bookingSource} onChange={e => setForm(f => ({ ...f, bookingSource: e.target.value }))} className={SELECT}>
                  {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Booking Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                  {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <hr className="border-slate-100" />
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Guest Details</p>
              {guests.map((guest, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Guest {index + 1}{index === 0 ? " (Primary)" : ""}</p>
                  <input placeholder="Full Name *" value={guest.name} onChange={e => updateGuest(index, "name", e.target.value)} className={INPUT} />
                  <input placeholder="Phone" value={guest.phone} onChange={e => updateGuest(index, "phone", e.target.value)} className={INPUT} />
                  <select value={guest.idProofType} onChange={e => updateGuest(index, "idProofType", e.target.value)} className={SELECT}>
                    {_cfg.idProofTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input placeholder={_cfg.idProofTypes.find(t => t.value === guest.idProofType)?.placeholder || "ID number"} value={guest.idProofNumber} onChange={e => updateGuest(index, "idProofNumber", e.target.value)} className={INPUT} />
                </div>
              ))}
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2">{formError}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowAddModal(false); setForm(emptyForm()); setGuests([makeGuest()]); setFormError(""); }} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAddBooking} disabled={submitting} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60">{submitting ? "Saving..." : "Add Booking"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-800">Edit Booking</h2>
              <button onClick={() => { setShowEditModal(false); setEditingBooking(null); setEditError(""); }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-in</label><input type="date" value={editForm.checkIn} onChange={e => setEditForm(f => ({ ...f, checkIn: e.target.value }))} className={INPUT} /></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-out</label><input type="date" value={editForm.checkOut} onChange={e => setEditForm(f => ({ ...f, checkOut: e.target.value }))} className={INPUT} /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Room</label>
                <select value={editForm.roomId} onChange={e => setEditForm(f => ({ ...f, roomId: e.target.value }))} className={SELECT}>
                  <option value="">No specific room</option>
                  {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type}) — {sym}{r.price_per_night}/night</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount ({sym})</label><input type="number" min="0" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} className={INPUT} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Status</label>
                  <select value={editForm.paymentStatus} onChange={e => setEditForm(f => ({ ...f, paymentStatus: e.target.value }))} className={SELECT}>
                    <option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Booking Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                    {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <hr className="border-slate-100" />
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Guest Details</p>
              {editGuests.map((guest, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Guest {index + 1}{index === 0 ? " (Primary)" : ""}</p>
                  <input placeholder="Full Name" value={guest.name} onChange={e => updateEditGuest(index, "name", e.target.value)} className={INPUT} />
                  <input placeholder="Phone" value={guest.phone} onChange={e => updateEditGuest(index, "phone", e.target.value)} className={INPUT} />
                  <select value={guest.idProofType} onChange={e => updateEditGuest(index, "idProofType", e.target.value)} className={SELECT}>
                    {_cfg.idProofTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input placeholder={_cfg.idProofTypes.find(t => t.value === guest.idProofType)?.placeholder || "ID number"} value={guest.idProofNumber} onChange={e => updateEditGuest(index, "idProofNumber", e.target.value)} className={INPUT} />
                </div>
              ))}
              {editError && <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowEditModal(false); setEditingBooking(null); setEditError(""); }} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleEditBooking} disabled={editSubmitting} className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-60">{editSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
