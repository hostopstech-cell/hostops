"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Booking, BookingStatus, BookingSource, PaymentMethod, Property, Room, Bed } from "@/types";
import {
  Plus, Edit, Trash2, Search, Calendar, User,
  X, CheckCircle, Clock, LogIn, LogOut, XCircle,
  MoreVertical, ChevronLeft, ChevronRight, Upload, Building2,
  BedDouble, TrendingUp, CreditCard
} from "lucide-react";

const BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const BOOKING_SOURCES: { value: BookingSource; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "walk_in", label: "Walk-in" },
  { value: "airbnb", label: "Airbnb" },
  { value: "booking_com", label: "Booking.com" },
  { value: "goibibo", label: "Goibibo" },
  { value: "makemytrip", label: "MakeMyTrip" },
  { value: "hostelworld", label: "Hostelworld" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const ID_PROOF_TYPES = [
  { value: "aadhar", label: "Aadhar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

const ITEMS_PER_PAGE = 10;

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; cls: string; Icon: any }> = {
    pending:     { label: "Pending",     cls: "bg-amber-50 text-amber-700 border border-amber-200",       Icon: Clock },
    confirmed:   { label: "Confirmed",   cls: "bg-blue-50 text-blue-700 border border-blue-200",          Icon: CheckCircle },
    checked_in:  { label: "Checked In",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: LogIn },
    checked_out: { label: "Checked Out", cls: "bg-slate-100 text-slate-600 border border-slate-200",      Icon: LogOut },
    cancelled:   { label: "Cancelled",   cls: "bg-red-50 text-red-600 border border-red-200",             Icon: XCircle },
  };
  const { label, cls, Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

// ── Dropdown menu rendered via portal-like absolute positioning ──
function ActionMenu({
  booking,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
}: {
  booking: Booking;
  onEdit: () => void;
  onDelete: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="flex items-center gap-1">
      {booking.status === "confirmed" && (
        <button
          onClick={onCheckIn}
          title="Check In"
          className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all"
        >
          <LogIn size={13} />
        </button>
      )}
      {booking.status === "checked_in" && (
        <button
          onClick={onCheckOut}
          title="Check Out"
          className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all"
        >
          <LogOut size={13} />
        </button>
      )}
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
        >
          <MoreVertical size={14} />
        </button>
        {open && (
          <div className="fixed z-[9999] w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1"
            style={{
              top: (() => {
                const el = containerRef.current;
                if (!el) return 0;
                const rect = el.getBoundingClientRect();
                return rect.bottom + 4;
              })(),
              right: (() => {
                const el = containerRef.current;
                if (!el) return 0;
                return window.innerWidth - el.getBoundingClientRect().right;
              })(),
            }}
          >
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit size={13} className="text-slate-400" /> Edit
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<BookingSource | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    guestName: "", guestPhone: "", guestEmail: "",
    idProofType: "aadhar", idProofNumber: "",
    propertyId: "", roomId: "", bedId: "",
    checkIn: "", checkOut: "",
    numberOfGuests: "1", amount: "", discount: "0",
    paymentMethod: "upi" as PaymentMethod,
    paymentStatus: "pending" as "paid" | "pending" | "partial" | "refunded",
    bookingSource: "direct" as BookingSource,
    specialRequests: "", notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [infoBooking, setInfoBooking] = useState<any>(null);

  async function fetchData() {
    try {
      const [bookingsRes, propsRes, roomsRes, bedsRes] = await Promise.all([
        fetch("/api/bookings"), fetch("/api/properties"),
        fetch("/api/rooms"), fetch("/api/beds"),
      ]);
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings ?? []); }
      if (propsRes.ok)    { const d = await propsRes.json();    setProperties(d.properties ?? []); }
      if (roomsRes.ok)    { const d = await roomsRes.json();    setRooms(d.rooms ?? []); }
      if (bedsRes.ok)     { const d = await bedsRes.json();     setBeds(d.beds ?? []); }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3500);
      return () => clearTimeout(t);
    }
  }, [success]);

  function openAdd() {
    setEditingBooking(null);
    setForm(emptyForm);
    setIdProofFile(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(booking: Booking) {
    setEditingBooking(booking);
    setForm({
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone || "",
      guestEmail: booking.guest_email || "",
      idProofType: (booking as any).id_proof_type || "aadhar",
      idProofNumber: (booking as any).id_proof_number || "",
      propertyId: String(booking.property_id),
      roomId: booking.room_id ? String(booking.room_id) : "",
      bedId: booking.bed_id ? String(booking.bed_id) : "",
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      numberOfGuests: String(booking.number_of_guests),
      amount: String(booking.amount),
      discount: String(booking.discount),
      paymentMethod: booking.payment_method || "upi",
      paymentStatus: booking.payment_status,
      bookingSource: booking.booking_source,
      specialRequests: booking.special_requests || "",
      notes: booking.notes || "",
    });
    setIdProofFile(null);
    setError("");
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this booking?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) { setSuccess("Booking deleted!"); await fetchData(); }
    else setError("Failed to delete");
  }

  async function handleCheckIn(id: number) {
    const res = await fetch(`/api/bookings/${id}/check-in`, { method: "POST" });
    if (res.ok) { setSuccess("Guest checked in!"); await fetchData(); }
    else setError("Failed to check in");
  }

  async function handleCheckOut(id: number) {
    const res = await fetch(`/api/bookings/${id}/check-out`, { method: "POST" });
    if (res.ok) { setSuccess("Guest checked out!"); await fetchData(); }
    else setError("Failed to check out");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const finalAmount = Number(form.amount) - Number(form.discount);
      const bookingCode = editingBooking
        ? editingBooking.booking_code
        : `BK${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";
      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, finalAmount, bookingCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save booking"); return; }
      setSuccess(editingBooking ? "Booking updated!" : "Booking created!");
      setShowModal(false);
      await fetchData();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  // Derived stats
  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns    = bookings.filter(b => b.check_in?.slice(0, 10) === today).length;
  const todayCheckOuts   = bookings.filter(b => b.check_out?.slice(0, 10) === today).length;
  const upcomingBookings = bookings.filter(b => b.check_in?.slice(0, 10) > today && b.status !== "cancelled").length;

  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.guest_name.toLowerCase().includes(q) ||
      b.guest_phone?.toLowerCase().includes(q) ||
      b.booking_code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSource = sourceFilter === "all" || b.booking_source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginated  = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const filteredRooms = form.propertyId ? rooms.filter(r => r.property_id === Number(form.propertyId)) : rooms;
  const filteredBeds  = form.roomId ? beds.filter(b => b.room_id === Number(form.roomId)) : [];

  function getRoomLabel(roomId: number) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return "";
    const cap    = Number(room.capacity) || Number(room.number_of_beds) || 0;
    const booked = bookings.filter(b => b.room_id === roomId && ["confirmed", "checked_in"].includes(b.status)).length;
    return `${room.name} (${cap - booked}/${cap} avail)`;
  }

  function handleBedSelect(bedId: string) {
    const bed = beds.find(b => b.id === Number(bedId));
    setForm(prev => ({
      ...prev,
      bedId,
      amount: bed && !prev.amount ? String(bed.price_per_night) : prev.amount,
    }));
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage all bookings and reservations</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings",     value: bookings.length, sub: "↑ 15% vs last month", iconBg: "bg-orange-100", iconColor: "text-orange-500", dot: "bg-orange-400",  Icon: Calendar },
          { label: "Today's Check-ins",  value: todayCheckIns,   sub: "In next 7 days",       iconBg: "bg-blue-100",   iconColor: "text-blue-500",   dot: "bg-blue-400",    Icon: LogIn },
          { label: "Today's Check-outs", value: todayCheckOuts,  sub: "vs yesterday",          iconBg: "bg-violet-100", iconColor: "text-violet-500", dot: "bg-violet-400",  Icon: LogOut },
          { label: "Upcoming Bookings",  value: upcomingBookings,sub: "In next 7 days",        iconBg: "bg-emerald-100",iconColor: "text-emerald-500",dot: "bg-emerald-400", Icon: TrendingUp },
        ].map(({ label, value, sub, iconBg, iconColor, dot, Icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={17} className={iconColor} />
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or code..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-9 text-sm w-full"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }} className="input-field text-sm w-auto">
          <option value="all">All Status</option>
          {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value as any); setCurrentPage(1); }} className="input-field text-sm w-auto">
          <option value="all">All Sources</option>
          {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {filteredBookings.length > 0 && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium ml-auto">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{success}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">No bookings found</p>
          <p className="text-sm text-slate-400 mb-6">
            {searchTerm || statusFilter !== "all" || sourceFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first booking to get started."}
          </p>
          {!searchTerm && statusFilter === "all" && sourceFilter === "all" && (
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Add Booking
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Guest", "Property / Bed", "Check-in", "Check-out", "Amount", "Source", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((booking) => {
                    const property = properties.find(p => p.id === booking.property_id);
                    const room     = rooms.find(r => r.id === booking.room_id);
                    const bed      = beds.find(b => b.id === booking.bed_id);
                    const initials = booking.guest_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Guest */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-orange-600">{initials}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{booking.guest_name}</p>
                              <p className="text-xs text-slate-400">{booking.guest_phone}</p>
                            </div>
                          </div>
                        </td>
                        {/* Property/Bed */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">{property?.name || "—"}</p>
                          <p className="text-xs text-slate-400">
                            {room?.name}{bed ? ` · Bed ${bed.bed_number}` : ""}
                          </p>
                        </td>
                        {/* Dates */}
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(booking.check_in)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(booking.check_out)}</td>
                        {/* Amount */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">₹{booking.final_amount}</p>
                          <p className={`text-[10px] font-semibold ${
                            booking.payment_status === "paid" ? "text-emerald-600" :
                            booking.payment_status === "partial" ? "text-amber-600" : "text-red-500"
                          }`}>
                            {capitalize(booking.payment_status)}
                          </p>
                        </td>
                        {/* Source */}
                        <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                          {booking.booking_source?.replace("_", " ")}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                        {/* Actions — each row has its own isolated dropdown */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setInfoBooking(booking)} className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100" title="Payment Info">&#9432;</button>
                            <ActionMenu
                              booking={booking}
                              onEdit={() => openEdit(booking)}
                              onDelete={() => handleDelete(booking.id)}
                              onCheckIn={() => handleCheckIn(booking.id)}
                              onCheckOut={() => handleCheckOut(booking.id)}
                            />
                          </div>
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === p ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          ADD / EDIT BOOKING MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingBooking ? "Edit Booking" : "Add Booking"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingBooking ? "Update booking details" : "Create a new booking"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* ── Guest Details ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center">
                    <User size={13} className="text-orange-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Guest Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Guest Name *</label>
                    <input type="text" required placeholder="Enter guest name"
                      value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone *</label>
                    <input type="tel" required placeholder="Enter phone number"
                      value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                    <input type="email" placeholder="Enter email (optional)"
                      value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Proof Type</label>
                    <select value={form.idProofType} onChange={e => setForm({ ...form, idProofType: e.target.value })}
                      className="input-field w-full text-sm">
                      {ID_PROOF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Number *</label>
                    <input type="text" required placeholder="Enter ID number"
                      value={form.idProofNumber} onChange={e => setForm({ ...form, idProofNumber: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Proof Photo</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all"
                    >
                      <Upload size={20} className="text-slate-300 mb-2" />
                      <p className="text-xs font-medium text-slate-400">
                        {idProofFile ? idProofFile.name : "Upload ID proof"}
                      </p>
                      <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG or PDF (Max. 2MB)</p>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden"
                        onChange={e => setIdProofFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* ── Booking Details ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BedDouble size={13} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Booking Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property *</label>
                    <select required value={form.propertyId}
                      onChange={e => setForm({ ...form, propertyId: e.target.value, roomId: "", bedId: "" })}
                      className="input-field w-full text-sm">
                      <option value="">Select Property</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Room / Bed *</label>
                    <div className="flex gap-2">
                      <select value={form.roomId}
                        onChange={e => setForm({ ...form, roomId: e.target.value, bedId: "" })}
                        className="input-field text-sm flex-1">
                        <option value="">Room</option>
                        {filteredRooms.map(r => <option key={r.id} value={r.id}>{getRoomLabel(r.id)}</option>)}
                      </select>
                      <select value={form.bedId} onChange={e => handleBedSelect(e.target.value)}
                        className="input-field text-sm flex-1">
                        <option value="">Bed</option>
                        {filteredBeds.map(b => <option key={b.id} value={b.id}>{b.bed_number}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-in Date *</label>
                    <input type="date" required value={form.checkIn}
                      onChange={e => setForm({ ...form, checkIn: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-out Date *</label>
                    <input type="date" required value={form.checkOut} min={form.checkIn}
                      onChange={e => setForm({ ...form, checkOut: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₹) *</label>
                    <input type="number" required min={0} placeholder="2000"
                      value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount (₹)</label>
                    <input type="number" min={0} placeholder="0"
                      value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                  {form.amount && (
                    <div className="col-span-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Final Amount</span>
                      <span className="text-base font-bold text-orange-600">
                        ₹{Math.max(Number(form.amount) - Number(form.discount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                    <select value={form.paymentMethod}
                      onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                      className="input-field w-full text-sm">
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Status</label>
                    <select value={form.paymentStatus}
                      onChange={e => setForm({ ...form, paymentStatus: e.target.value as any })}
                      className="input-field w-full text-sm">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Booking Source</label>
                    <select value={form.bookingSource}
                      onChange={e => setForm({ ...form, bookingSource: e.target.value as BookingSource })}
                      className="input-field w-full text-sm">
                      {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">No. of Guests</label>
                    <input type="number" min={1} placeholder="1"
                      value={form.numberOfGuests} onChange={e => setForm({ ...form, numberOfGuests: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? "Saving..." : editingBooking ? "Update Booking" : "Create Booking"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    {infoBooking && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <h2 className="text-lg font-bold mb-1">Payment Info</h2>
          <p className="text-sm text-slate-500 mb-3">{infoBooking.guest_name} — {infoBooking.booking_code}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Amount</span><span className="font-semibold">Rs.{infoBooking.final_amount}</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Status</span><span className={infoBooking.payment_status === "paid" ? "text-green-600 font-semibold" : "text-orange-500"}>{infoBooking.payment_status || "pending"}</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Sender</span><span>{infoBooking.payment_sender_name || "-"}</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">UTR</span><span className="font-mono text-xs">{infoBooking.utr_number || "-"}</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Pay Date</span><span>{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "-"}</span></div>
          </div>
          <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg text-sm">Close</button>
        </div>
      </div>
    )}
    </div>
  );
}
