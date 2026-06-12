"use client";
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
function makeGuest(): GuestDetail { return { name: "", phone: "", idProofType: "aadhar", idProofNumber: "" }; }

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
      if (pg.idProofType === "aadhar" && !/^\d{12}$/.test(id)) { setFormError("Aadhar must be exactly 12 digits"); return; }
      if (pg.idProofType === "pan" && !/^[A-Z]{5}\d{4}[A-Z]$/.test(id)) { setFormError("Invalid PAN format (e.g. ABCDE1234F)"); return; }
      if (pg.idProofType === "passport" && !/^[A-Z]\d{7}$/.test(id)) { setFormError("Invalid Passport (e.g. A1234567)"); return; }
      if (pg.idProofType === "voter_id" && !/^[A-Z]{3}\d{7}$/.test(id)) { setFormError("Invalid Voter ID format"); return; }
      if (pg.idProofType === "driving_license" && !/^[A-Z0-9]{10,16}$/.test(id)) { setFormError("Invalid Driving License format"); return; }
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
        {allGuests.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${getAvatarColor(g.name || "G")}`}>{getInitials(g.name || "G")}</div>
            <div><p className="text-xs font-semibold text-slate-900">{g.name || "—"}</p><p className="text-[11px] text-slate-400">{g.phone || ""}</p></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {success && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg border ${success.startsWith("Error") ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
          <p className={`text-sm font-semibold ${success.startsWith("Error") ? "text-red-700" : "text-emerald-700"}`}>{success.startsWith("Error") ? "⚠ " : "✓ "}{success}</p>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">H</div>
            <div><p className="font-bold text-slate-800 text-sm">{propertyName}</p><p className="text-xs text-slate-400">Staff Portal • Last 7 days</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full hidden sm:block">● Live</span>
            <button onClick={() => { setForm(emptyForm()); setGuests([makeGuest()]); setFormError(""); setShowAddModal(true); }} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">+ Add Booking</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Bookings", value: bookings.length, icon: "📋" },
            { label: "Today Check-ins", value: todayCheckIns, icon: "🔑" },
            { label: "Today Check-outs", value: todayCheckOuts, icon: "🧳" },
            { label: "Currently In", value: currentlyIn, icon: "🛏" },
            { label: "Rooms Available", value: `${availableRooms}/${totalRooms}`, icon: "🏠" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-1.5 mb-1"><span className="text-base">{icon}</span><p className="text-xs text-slate-500 font-medium">{label}</p></div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {rooms.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Room Status Today</p>
            <div className="flex flex-wrap gap-2">
              {rooms.map((r: any) => {
                const active = bookings.find(b => b.room_id === r.id && b.status === "checked_in");
                const reserved = bookings.find(b => b.room_id === r.id && b.status === "confirmed" && b.check_in?.slice(0,10) <= today && b.check_out?.slice(0,10) >= today);
                const s = active ? "in" : reserved ? "reserved" : "free";
                return (
                  <div key={r.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${s === "in" ? "bg-red-50 border-red-200 text-red-700" : s === "reserved" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    <span>{s === "in" ? "🔴" : s === "reserved" ? "🟡" : "🟢"}</span>
                    <span>{r.name}</span>
                    {s === "in" && <span className="opacity-60">({active?.guest_name?.split(" ")[0]})</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2">🔴 Checked In &nbsp; 🟡 Reserved &nbsp; 🟢 Available</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input type="text" placeholder="Search guest, phone, booking ID..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-8 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="text-sm text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-orange-400">
            <option value="all">All Status</option>
            {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {filtered.length > 0 && <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium ml-auto">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-lg font-bold text-slate-800 mb-1">No bookings found</p>
            <p className="text-sm text-slate-400">{searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : "No bookings in last 7 days."}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Guest", "Room", "Check-in → Check-out", "Nights", "Amount", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map(b => {
                      const nights = b.check_in && b.check_out ? Math.max(1, Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000)) : "—";
                      const roomName = b.room_id ? getRoomName(b.room_id) : null;
                      const isLoading = actionLoading === b.id;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3"><GuestCell booking={b} /></td>
                          <td className="px-4 py-3">
                            {roomName ? <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg">{roomName}</span> : <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                            <p className="text-[11px] text-slate-400">{b.booking_code}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{nights}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-slate-900">₹{Number(b.final_amount || b.amount || 0).toLocaleString("en-IN")}</p>
                            <p className={`text-[11px] font-semibold ${b.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{capitalize(b.payment_status)}</p>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {b.status === "confirmed" && (
                                <button onClick={() => handleCheckIn(b.id)} disabled={isLoading} className="text-[10px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap">
                                  {isLoading ? "..." : "✓ Check In"}
                                </button>
                              )}
                              {b.status === "checked_in" && (
                                <button onClick={() => handleCheckOut(b.id)} disabled={isLoading} className="text-[10px] font-semibold bg-slate-700 hover:bg-slate-800 text-white px-2 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap">
                                  {isLoading ? "..." : "→ Check Out"}
                                </button>
                              )}
                              <button onClick={() => openEditModal(b)} className="h-7 w-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-100" title="Edit">✏️</button>
                              <button onClick={() => setInfoBooking(b)} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50" title="Info">👁</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Showing {(currentPage-1)*ITEMS_PER_PAGE+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`h-8 w-8 rounded-lg text-sm font-semibold ${currentPage===p ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600"}`}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30">›</button>
                </div>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-slate-400 text-center pb-4">HostOps Staff Portal</p>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-base font-bold text-slate-800">Add New Booking</h2><p className="text-xs text-slate-400 mt-0.5">Fill in booking and guest details</p></div>
              <button onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📅 Booking Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-in *</label><input type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-out *</label><input type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                      <option value="confirmed">Confirmed</option><option value="checked_in">Checked In</option><option value="pending">Pending</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Source</label>
                    <select value={form.bookingSource} onChange={e => setForm(f => ({ ...f, bookingSource: e.target.value }))} className={SELECT}>
                      {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">No. of Guests</label><input type="number" min="1" max="20" value={form.numberOfGuests} onChange={e => setForm(f => ({ ...f, numberOfGuests: e.target.value }))} className={INPUT} /></div>
                  <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">🏠 Room (Optional)</label>
                    <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className={SELECT}>
                      <option value="">— No specific room —</option>
                      {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type}) — ₹{r.price_per_night}/night</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">💳 Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label><input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Status</label>
                    <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))} className={SELECT}>
                      <option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className={SELECT}>
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">UTR Number</label><input value={form.utrNumber} onChange={e => setForm(f => ({ ...f, utrNumber: e.target.value }))} placeholder="123456789012" className={INPUT} /></div>
                  <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">Sender Name</label><input value={form.paymentSenderName} onChange={e => setForm(f => ({ ...f, paymentSenderName: e.target.value }))} className={INPUT} /></div>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">👤 Guest Details</p>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{guests.length} guest{guests.length !== 1 ? "s" : ""}</span>
                </div>
                {guests.map((guest, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-600 mb-3">{index === 0 ? "👤 Primary Guest" : `👤 Guest ${index + 1}`}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Name {index === 0 ? "*" : ""}</label><input value={guest.name} onChange={e => updateGuest(index, "name", e.target.value)} placeholder="Guest name" className={INPUT} /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone {index === 0 ? "*" : ""}</label><input type="tel" value={guest.phone} onChange={e => updateGuest(index, "phone", e.target.value)} placeholder="Phone" className={INPUT} /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Type</label>
                        <select value={guest.idProofType} onChange={e => updateGuest(index, "idProofType", e.target.value)} className={SELECT}>
                          {ID_PROOF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Number</label><input value={guest.idProofNumber} onChange={e => updateGuest(index, "idProofNumber", e.target.value)} placeholder="ID number" className={INPUT} /></div>
                    </div>
                  </div>
                ))}
              </div>
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={handleAddBooking} disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50">{submitting ? "Adding..." : "Add Booking"}</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-base font-bold text-slate-800">Edit Booking</h2><p className="text-xs text-slate-400 mt-0.5">#{editingBooking.booking_code}</p></div>
              <button onClick={() => setShowEditModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📅 Booking Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-in *</label><input type="date" value={editForm.checkIn} onChange={e => setEditForm(f => ({ ...f, checkIn: e.target.value }))} className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-out *</label><input type="date" value={editForm.checkOut} min={editForm.checkIn} onChange={e => setEditForm(f => ({ ...f, checkOut: e.target.value }))} className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                      {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Source</label>
                    <select value={editForm.bookingSource} onChange={e => setEditForm(f => ({ ...f, bookingSource: e.target.value }))} className={SELECT}>
                      {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">No. of Guests</label><input type="number" min="1" max="20" value={editForm.numberOfGuests} onChange={e => setEditForm(f => ({ ...f, numberOfGuests: e.target.value }))} className={INPUT} /></div>
                  <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">🏠 Room</label>
                    <select value={editForm.roomId} onChange={e => setEditForm(f => ({ ...f, roomId: e.target.value }))} className={SELECT}>
                      <option value="">— No specific room —</option>
                      {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type}) — ₹{r.price_per_night}/night</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">💳 Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label><input type="number" min="0" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} className={INPUT} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Status</label>
                    <select value={editForm.paymentStatus} onChange={e => setEditForm(f => ({ ...f, paymentStatus: e.target.value }))} className={SELECT}>
                      <option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Method</label>
                    <select value={editForm.paymentMethod} onChange={e => setEditForm(f => ({ ...f, paymentMethod: e.target.value }))} className={SELECT}>
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">UTR Number</label><input value={editForm.utrNumber} onChange={e => setEditForm(f => ({ ...f, utrNumber: e.target.value }))} className={INPUT} /></div>
                  <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">Sender Name</label><input value={editForm.paymentSenderName} onChange={e => setEditForm(f => ({ ...f, paymentSenderName: e.target.value }))} className={INPUT} /></div>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">👤 Guest Details</p>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{editGuests.length} guest{editGuests.length !== 1 ? "s" : ""}</span>
                </div>
                {editGuests.map((guest, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-600 mb-3">{index === 0 ? "👤 Primary Guest" : `👤 Guest ${index + 1}`}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label><input value={guest.name} onChange={e => updateEditGuest(index, "name", e.target.value)} className={INPUT} /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label><input value={guest.phone} onChange={e => updateEditGuest(index, "phone", e.target.value)} className={INPUT} /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Type</label>
                        <select value={guest.idProofType} onChange={e => updateEditGuest(index, "idProofType", e.target.value)} className={SELECT}>
                          {ID_PROOF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Number</label><input value={guest.idProofNumber} onChange={e => updateEditGuest(index, "idProofNumber", e.target.value)} className={INPUT} /></div>
                    </div>
                  </div>
                ))}
              </div>
              {editError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{editError}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={handleEditBooking} disabled={editSubmitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50">{editSubmitting ? "Saving..." : "Update Booking"}</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-lg font-bold text-slate-900">Booking Details</h2><p className="text-sm text-slate-500">{infoBooking.guest_name} — #{infoBooking.booking_code}</p></div>
              <button onClick={() => setInfoBooking(null)} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-1 text-sm">
              {[
                { label: "Room", value: infoBooking.room_id ? (getRoomName(infoBooking.room_id) || "—") : "—" },
                { label: "Check-in", value: formatDate(infoBooking.check_in) },
                { label: "Check-out", value: formatDate(infoBooking.check_out) },
                { label: "Guests", value: infoBooking.number_of_guests },
                { label: "Amount", value: `₹${Number(infoBooking.final_amount || infoBooking.amount || 0).toLocaleString("en-IN")}` },
                { label: "Payment", value: capitalize(infoBooking.payment_status), colored: true },
                { label: "Method", value: capitalize(infoBooking.payment_method) || "—" },
                { label: "UTR", value: infoBooking.utr_number || "—" },
                { label: "Sender", value: infoBooking.payment_sender_name || "—" },
                { label: "Source", value: infoBooking.booking_source?.replace(/_/g, " ") || "—" },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${ (item as any).colored ? (infoBooking.payment_status === "paid" ? "text-emerald-600" : "text-amber-600") : "text-slate-900"}`}>{item.value}</span>
                </div>
              ))}
            </div>
            {infoBooking.number_of_guests > 1 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">All Guests</p>
                {parseAllGuests(infoBooking).map((g, i) => (
                  <div key={i} className="text-xs bg-slate-50 rounded-lg px-3 py-2 mb-1.5">
                    <span className="font-semibold">{i + 1}. {g.name || "—"}</span>
                    {g.phone && <span className="text-slate-400 ml-2">{g.phone}</span>}
                    {g.idProofNumber && <span className="text-slate-400 ml-2">• {g.idProofType?.toUpperCase()}: {g.idProofNumber}</span>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
