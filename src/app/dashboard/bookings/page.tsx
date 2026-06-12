"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Booking, BookingStatus, BookingSource, PaymentMethod, Property, Room, Bed } from "@/types";
import {
  Plus, Edit, Trash2, Search, Calendar, User,
  X, CheckCircle, Clock, LogIn, LogOut, XCircle,
  MoreVertical, ChevronLeft, ChevronRight, Building2,
  BedDouble, TrendingUp, CreditCard, Download, Filter,
  Eye
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

interface GuestDetail {
  name: string;
  phone: string;
  idProofType: string;
  idProofNumber: string;
  idError: string;
}

function makeGuest(): GuestDetail {
  return { name: "", phone: "", idProofType: "aadhar", idProofNumber: "", idError: "" };
}

function validateIdProof(type: string, value: string): string {
  if (!value) return "";
  switch (type) {
    case "aadhar":
      if (!/^\d{12}$/.test(value)) return "Aadhaar must be exactly 12 digits";
      break;
    case "pan":
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return "PAN format: ABCDE1234F";
      break;
    case "passport":
      if (!/^[A-Z]{1}[0-9]{7}$/.test(value)) return "Passport format: A1234567";
      break;
    case "voter_id":
      if (!/^[A-Z]{3}[0-9]{7}$/.test(value)) return "Voter ID format: ABC1234567";
      break;
    case "driving_license":
      if (!/^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(value) && !/^[A-Z]{2}-\d{2}-\d{4}-\d{7}$/.test(value))
        return "Invalid driving license format";
      break;
  }
  return "";
}

function getIdMaxLength(type: string): number {
  switch (type) {
    case "aadhar": return 12;
    case "pan": return 10;
    case "passport": return 8;
    case "voter_id": return 10;
    default: return 20;
  }
}

function sanitizeId(type: string, value: string): string {
  if (type === "aadhar") return value.replace(/\D/g, "").slice(0, 12);
  if (type === "pan" || type === "passport" || type === "voter_id") return value.toUpperCase().slice(0, getIdMaxLength(type));
  return value.toUpperCase().slice(0, 20);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; cls: string; Icon: any }> = {
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200", Icon: Clock },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700 border border-blue-200", Icon: CheckCircle },
    checked_in: { label: "Checked In", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: LogIn },
    checked_out: { label: "Checked Out", cls: "bg-slate-100 text-slate-600 border border-slate-200", Icon: LogOut },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-200", Icon: XCircle },
  };
  const { label, cls, Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

function ActionMenu({
  booking, onEdit, onDelete, onCheckIn, onCheckOut,
}: {
  booking: Booking; onEdit: () => void; onDelete: () => void; onCheckIn: () => void; onCheckOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="flex items-center gap-1">
      {booking.status === "confirmed" && (
        <button onClick={onCheckIn} title="Check In"
          className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all">
          <LogIn size={13} />
        </button>
      )}
      {booking.status === "checked_in" && (
        <button onClick={onCheckOut} title="Check Out"
          className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all">
          <LogOut size={13} />
        </button>
      )}
      <div ref={containerRef} className="relative">
        <button onClick={() => setOpen((v) => !v)}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
          <MoreVertical size={14} />
        </button>
        {open && (
          <div className="fixed z-[9999] w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1"
            style={{
              top: (() => { const el = containerRef.current; if (!el) return 0; return el.getBoundingClientRect().bottom + 4; })(),
              right: (() => { const el = containerRef.current; if (!el) return 0; return window.innerWidth - el.getBoundingClientRect().right; })(),
            }}>
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <Edit size={13} className="text-slate-400" /> Edit
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Group Guest Cell: timeline style like reference image ──
function GuestCell({ booking }: { booking: Booking }) {
  const primary = { name: booking.guest_name, phone: booking.guest_phone || "" };
  let allGuests: { name: string; phone: string }[] = [primary];
  try {
    const gd = (booking as any).guests_data;
    const parsed = typeof gd === "string" ? JSON.parse(gd) : gd;
    if (Array.isArray(parsed) && parsed.length > 0) {
      allGuests = [primary, ...parsed.map((g: any) => ({ name: g.name || "", phone: g.phone || "" }))];
    }
  } catch {}

  const isGroup = allGuests.length > 1;

  if (!isGroup) {
    const color = getAvatarColor(booking.guest_name);
    return (
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${color}`}>
          {getInitials(booking.guest_name)}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm leading-tight">{booking.guest_name}</p>
          <p className="text-xs text-slate-400">{booking.guest_phone}</p>
        </div>
      </div>
    );
  }

  // Group: timeline layout
  return (
    <div className="flex gap-2">
      {/* Orange vertical line with dots */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 16 }}>
        {allGuests.map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1" />
            {i < allGuests.length - 1 && (
              <div className="w-0.5 bg-orange-200 flex-grow" style={{ minHeight: 32 }} />
            )}
          </div>
        ))}
      </div>
      {/* Guest list */}
      <div className="flex flex-col gap-1 min-w-0">
        {allGuests.map((g, i) => {
          const color = getAvatarColor(g.name || "G");
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${color}`}>
                {getInitials(g.name || "G")}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">{g.name}</p>
                <p className="text-[11px] text-slate-400">{g.phone}</p>
              </div>
            </div>
          );
        })}
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
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [infoBooking, setInfoBooking] = useState<any>(null);

  const emptyForm = {
    propertyId: "", roomId: "", bedId: "",
    checkIn: "", checkOut: "",
    numberOfGuests: "1", amount: "", discount: "0",
    paymentMethod: "upi" as PaymentMethod,
    paymentStatus: "pending" as "paid" | "pending" | "partial" | "refunded",
    bookingSource: "direct" as BookingSource,
    specialRequests: "", notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [guests, setGuests] = useState<GuestDetail[]>([makeGuest()]);

  useEffect(() => {
    const n = Math.max(1, parseInt(form.numberOfGuests) || 1);
    setGuests(prev => {
      if (prev.length === n) return prev;
      if (prev.length < n) return [...prev, ...Array.from({ length: n - prev.length }, makeGuest)];
      return prev.slice(0, n);
    });
  }, [form.numberOfGuests]);

  function updateGuest(index: number, field: keyof GuestDetail, value: string) {
    setGuests(prev => prev.map((g, i) => {
      if (i !== index) return g;
      const updated = { ...g, [field]: value };
      if (field === "idProofNumber" || field === "idProofType") {
        updated.idProofNumber = field === "idProofNumber" ? sanitizeId(updated.idProofType, value) : sanitizeId(value, g.idProofNumber);
        updated.idError = validateIdProof(updated.idProofType, updated.idProofNumber);
      }
      return updated;
    }));
  }

  async function fetchData() {
    try {
      const [bookingsRes, propsRes, roomsRes, bedsRes] = await Promise.all([
        fetch("/api/bookings"), fetch("/api/properties"),
        fetch("/api/rooms"), fetch("/api/beds"),
      ]);
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings ?? []); }
      if (propsRes.ok) { const d = await propsRes.json(); setProperties(d.properties ?? []); }
      if (roomsRes.ok) { const d = await roomsRes.json(); setRooms(d.rooms ?? []); }
      if (bedsRes.ok) { const d = await bedsRes.json(); setBeds(d.beds ?? []); }
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
    setGuests([makeGuest()]);
    setError("");
    setShowModal(true);
  }

  function openEdit(booking: Booking) {
    setEditingBooking(booking);
    setForm({
      propertyId: String(booking.property_id),
      roomId: booking.room_id ? String(booking.room_id) : "",
      bedId: booking.bed_id ? String(booking.bed_id) : "",
      checkIn: booking.check_in?.slice(0, 10) || "",
      checkOut: booking.check_out?.slice(0, 10) || "",
      numberOfGuests: String(booking.number_of_guests),
      amount: String(booking.amount),
      discount: String(booking.discount),
      paymentMethod: booking.payment_method || "upi",
      paymentStatus: booking.payment_status,
      bookingSource: booking.booking_source,
      specialRequests: booking.special_requests || "",
      notes: booking.notes || "",
    });
    const primaryGuest: GuestDetail = {
      name: booking.guest_name,
      phone: booking.guest_phone || "",
      idProofType: (booking as any).id_proof_type || "aadhar",
      idProofNumber: (booking as any).id_proof_number || "",
      idError: "",
    };
    const n = Math.max(1, booking.number_of_guests || 1);
    let savedGuests: GuestDetail[] = [];
    try {
      const gd = (booking as any).guests_data;
      const parsed = typeof gd === "string" ? JSON.parse(gd) : gd;
      if (Array.isArray(parsed) && parsed.length > 0) {
        savedGuests = parsed.map((g: any) => ({
          name: g.name || "", phone: g.phone || "",
          idProofType: g.idProofType || "aadhar", idProofNumber: g.idProofNumber || "", idError: "",
        }));
      }
    } catch {}
    const allGuests = savedGuests.length >= n
      ? savedGuests.slice(0, n)
      : [primaryGuest, ...savedGuests, ...Array.from({ length: n - savedGuests.length }, makeGuest)];
    setGuests(allGuests.length > 0 ? allGuests : [primaryGuest]);
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
    for (let i = 0; i < guests.length; i++) {
      const err = validateIdProof(guests[i].idProofType, guests[i].idProofNumber);
      if (err) {
        setGuests(prev => prev.map((g, idx) => idx === i ? { ...g, idError: err } : g));
        setError(`Guest ${i + 1}: ${err}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const finalAmount = Number(form.amount) - Number(form.discount);
      const bookingCode = editingBooking
        ? editingBooking.booking_code
        : `BK${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";
      const method = editingBooking ? "PUT" : "POST";
      const primaryGuest = guests[0];
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guestName: primaryGuest.name,
          guestPhone: primaryGuest.phone,
          guestEmail: "",
          idProofType: primaryGuest.idProofType,
          idProofNumber: primaryGuest.idProofNumber,
          additionalGuests: guests.slice(1).map(g => ({
            name: g.name, phone: g.phone, idProofType: g.idProofType, idProofNumber: g.idProofNumber,
          })),
          finalAmount, bookingCode,
        }),
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

  // Export CSV
  function handleExport() {
    const headers = ["Booking Code", "Guest", "Phone", "Property", "Room", "Check-in", "Check-out", "Amount", "Payment", "Source", "Status"];
    const rows = filteredBookings.map(b => {
      const property = properties.find(p => p.id === b.property_id);
      const room = rooms.find(r => r.id === b.room_id);
      return [
        b.booking_code, b.guest_name, b.guest_phone || "",
        property?.name || "", room?.name || "",
        b.check_in?.slice(0, 10) || "", b.check_out?.slice(0, 10) || "",
        b.final_amount, b.payment_status, b.booking_source, b.status,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bookings.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns = bookings.filter(b => b.check_in?.slice(0, 10) === today).length;
  const todayCheckOuts = bookings.filter(b => b.check_out?.slice(0, 10) === today).length;
  const upcomingBookings = bookings.filter(b => b.check_in?.slice(0, 10) > today && b.status !== "cancelled").length;

  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.guest_name.toLowerCase().includes(q) ||
      (b.guest_phone?.toLowerCase() || "").includes(q) ||
      b.booking_code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSource = sourceFilter === "all" || b.booking_source === sourceFilter;
    const matchProperty = propertyFilter === "all" || String(b.property_id) === propertyFilter;
    return matchSearch && matchStatus && matchSource && matchProperty;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginated = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const filteredRooms = form.propertyId ? rooms.filter(r => r.property_id === Number(form.propertyId)) : rooms;
  const filteredBeds = form.roomId ? beds.filter(b => b.room_id === Number(form.roomId)) : [];

  function getRoomLabel(roomId: number) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return "";
    const cap = Number(room.capacity) || Number((room as any).number_of_beds) || 0;
    const booked = bookings.filter(b => b.room_id === roomId && ["confirmed", "checked_in"].includes(b.status)).length;
    return `${room.name} (${cap - booked}/${cap} avail)`;
  }

  function handleBedSelect(bedId: string) {
    const bed = beds.find(b => b.id === Number(bedId));
    setForm(prev => ({ ...prev, bedId, amount: bed && !prev.amount ? String(bed.price_per_night) : prev.amount }));
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage all bookings and reservations</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
            <Download size={15} /> Export
          </button>
          <button onClick={openAdd}
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Booking
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length, sub: "↑ 18% vs last month", iconBg: "bg-orange-100", iconColor: "text-orange-500", Icon: Calendar },
          { label: "Today's Check-ins", value: todayCheckIns, sub: "In next 7 days", iconBg: "bg-blue-100", iconColor: "text-blue-500", Icon: LogIn },
          { label: "Today's Check-outs", value: todayCheckOuts, sub: "vs yesterday", iconBg: "bg-violet-100", iconColor: "text-violet-500", Icon: LogOut },
          { label: "Upcoming Bookings", value: upcomingBookings, sub: "In next 7 days", iconBg: "bg-emerald-100", iconColor: "text-emerald-500", Icon: TrendingUp },
        ].map(({ label, value, sub, iconBg, iconColor, Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={iconColor} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by guest name, phone or booking ID..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-9 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }} className="input-field text-sm w-auto">
          <option value="all">All Status</option>
          {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={propertyFilter} onChange={e => { setPropertyFilter(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-auto">
          <option value="all">All Properties</option>
          {properties.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value as any); setCurrentPage(1); }} className="input-field text-sm w-auto">
          <option value="all">All Sources</option>
          {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {filteredBookings.length > 0 && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium ml-auto">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{success}</p>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">No bookings found</p>
          <p className="text-sm text-slate-400 mb-6">
            {searchTerm || statusFilter !== "all" || sourceFilter !== "all" || propertyFilter !== "all"
              ? "Try adjusting your filters." : "Create your first booking to get started."}
          </p>
          {!searchTerm && statusFilter === "all" && sourceFilter === "all" && propertyFilter === "all" && (
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Add Booking
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Guest", "Property / Bed", "Check-in", "Check-out", "Amount", "Source", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((booking) => {
                    const property = properties.find(p => p.id === booking.property_id);
                    const room = rooms.find(r => r.id === booking.room_id);
                    const bed = beds.find(b => b.id === booking.bed_id);
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <GuestCell booking={booking} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">{property?.name || "—"}</p>
                          <p className="text-xs text-slate-400">
                            {room?.name}{bed ? ` · Bed ${bed.bed_number}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-700 font-medium whitespace-nowrap">{formatDate(booking.check_in)}</p>
                          <p className="text-[11px] text-slate-400">{new Date(booking.check_in).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-700 font-medium whitespace-nowrap">{formatDate(booking.check_out)}</p>
                          <p className="text-[11px] text-slate-400">{new Date(booking.check_out).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">₹{Number(booking.final_amount).toLocaleString("en-IN")}</p>
                          <p className={`text-[11px] font-semibold ${
                            booking.payment_status === "paid" ? "text-emerald-600" :
                            booking.payment_status === "partial" ? "text-amber-600" : "text-red-500"
                          }`}>{capitalize(booking.payment_status)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                          {booking.booking_source?.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setInfoBooking(booking)}
                              className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all"
                              title="View Payment Info">
                              <Eye size={13} />
                            </button>
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
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
                    }`}>{p}</button>
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
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">

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

              {/* Booking Details */}
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Room / Bed</label>
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
                        ₹{Math.max(Number(form.amount) - Number(form.discount || 0), 0).toLocaleString("en-IN")}
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
                    <input type="number" min={1} max={20} placeholder="1"
                      value={form.numberOfGuests}
                      onChange={e => setForm({ ...form, numberOfGuests: e.target.value })}
                      className="input-field w-full text-sm" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Guest Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center">
                    <User size={13} className="text-orange-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Guest Details</h3>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {guests.length} guest{guests.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-4">
                  {guests.map((guest, index) => (
                    <div key={index} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                      <p className="text-xs font-bold text-slate-500 mb-3">
                        {index === 0 ? "👤 Primary Guest" : `👤 Guest ${index + 1}`}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name *</label>
                          <input type="text" required placeholder="Guest name"
                            value={guest.name}
                            onChange={e => updateGuest(index, "name", e.target.value)}
                            className="input-field w-full text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone *</label>
                          <input type="tel" required placeholder="Phone number"
                            value={guest.phone}
                            onChange={e => updateGuest(index, "phone", e.target.value)}
                            className="input-field w-full text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Proof Type</label>
                          <select value={guest.idProofType}
                            onChange={e => updateGuest(index, "idProofType", e.target.value)}
                            className="input-field w-full text-sm">
                            {ID_PROOF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Number *</label>
                          <input type="text" required placeholder="ID number"
                            value={guest.idProofNumber}
                            onChange={e => updateGuest(index, "idProofNumber", e.target.value)}
                            className={`input-field w-full text-sm ${guest.idError ? "border-red-400" : ""}`} />
                          {guest.idError && <p className="text-xs text-red-500 mt-1">{guest.idError}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
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
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Payment Info Modal ── */}
      {infoBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Info</h2>
                <p className="text-sm text-slate-500">{infoBooking.guest_name} — {infoBooking.booking_code}</p>
              </div>
              <button onClick={() => setInfoBooking(null)}
                className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">₹{Number(infoBooking.final_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={`font-semibold ${infoBooking.payment_status === "paid" ? "text-emerald-600" : "text-orange-500"}`}>
                  {infoBooking.payment_status === "pending" ? "⚠ Pending" : capitalize(infoBooking.payment_status)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Sender</span>
                <span className="text-slate-800 font-medium">{infoBooking.payment_sender_name || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">UTR</span>
                <span className={`font-mono text-xs font-semibold ${infoBooking.utr_number && !/^\d{12}$/.test(infoBooking.utr_number) ? "text-red-500" : "text-slate-800"}`}>
                  {infoBooking.utr_number || "—"}
                  {infoBooking.utr_number && !/^\d{12}$/.test(infoBooking.utr_number) && (
                    <span className="text-red-400 text-[9px] ml-1">⚠ Verify</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Pay Date</span>
                <span className="text-slate-800 font-medium">
                  {infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "—"}
                </span>
              </div>
            </div>
            {infoBooking.payment_status === "pending" && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-800 mb-1">⚠ Pending Payment</p>
                <p className="text-xs text-amber-700">Not counted in revenue until checked in after payment verified.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}