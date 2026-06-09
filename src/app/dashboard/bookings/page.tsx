"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Property, Room, Bed, BookingSource } from "@/types";

const BOOKING_SOURCES: { value: BookingSource; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "airbnb", label: "Airbnb" },
  { value: "booking_com", label: "Booking.com" },
  { value: "makemytrip", label: "MakeMyTrip" },
  { value: "goibibo", label: "Goibibo" },
  { value: "other", label: "Other" },
];

interface GuestForm {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  idProofType: string;
  idProofNumber: string;
}

const emptyGuest = (): GuestForm => ({
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  idProofType: "aadhar",
  idProofNumber: "",
});

interface BookingForm {
  propertyId: string;
  roomId: string;
  bedId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  amount: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: string;
  bookingSource: BookingSource;
  specialRequests: string;
  notes: string;
  guests: GuestForm[];
}

const emptyForm = (): BookingForm => ({
  propertyId: "",
  roomId: "",
  bedId: "",
  checkIn: "",
  checkOut: "",
  numberOfGuests: 1,
  amount: "",
  discount: "0",
  paymentMethod: "upi",
  paymentStatus: "paid",
  bookingSource: "direct",
  specialRequests: "",
  notes: "",
  guests: [emptyGuest()],
});

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/properties"),
      ]);
      const [bData, pData] = await Promise.all([bRes.json(), pRes.json()]);
      setBookings(bData.bookings || []);
      setProperties(pData.properties || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (form.propertyId) {
      fetch(`/api/rooms?propertyId=${form.propertyId}`).then(r => r.json()).then(d => setRooms(d.rooms || []));
    } else {
      setRooms([]);
    }
    setForm(f => ({ ...f, roomId: "", bedId: "" }));
    setBeds([]);
  }, [form.propertyId]);

  useEffect(() => {
    if (form.roomId) {
      fetch(`/api/beds?roomId=${form.roomId}`).then(r => r.json()).then(d => setBeds(d.beds || []));
    } else {
      setBeds([]);
    }
    setForm(f => ({ ...f, bedId: "" }));
  }, [form.roomId]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3500);
      return () => clearTimeout(t);
    }
  }, [success]);

  const updateGuest = (idx: number, field: keyof GuestForm, value: string) => {
    setForm(f => {
      const guests = [...f.guests];
      guests[idx] = { ...guests[idx], [field]: value };
      return { ...f, guests };
    });
  };

  const handleGuestCountChange = (count: number) => {
    const n = Math.max(1, Math.min(10, count));
    setForm(f => {
      const guests = [...f.guests];
      while (guests.length < n) guests.push(emptyGuest());
      return { ...f, numberOfGuests: n, guests: guests.slice(0, n) };
    });
  };

  function openAdd() {
    setEditingBooking(null);
    setForm(emptyForm());
    setError("");
    setShowModal(true);
  }

  function openEdit(booking: Booking) {
    setEditingBooking(booking);
    setError("");
    setForm({
      propertyId: String(booking.property_id),
      roomId: booking.room_id ? String(booking.room_id) : "",
      bedId: booking.bed_id ? String(booking.bed_id) : "",
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      numberOfGuests: booking.number_of_guests,
      amount: String(booking.amount),
      discount: String(booking.discount || "0"),
      paymentMethod: (booking as any).payment_method || "upi",
      paymentStatus: booking.payment_status || "paid",
      bookingSource: booking.booking_source || "direct",
      specialRequests: (booking as any).special_requests || "",
      notes: (booking as any).notes || "",
      guests: [{
        guestName: booking.guest_name || "",
        guestPhone: booking.guest_phone || "",
        guestEmail: (booking as any).guest_email || "",
        idProofType: (booking as any).id_proof_type || "aadhar",
        idProofNumber: (booking as any).id_proof_number || "",
      }],
    });
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
      const primaryGuest = form.guests[0];
      const payload = {
        guestName: primaryGuest.guestName,
        guestPhone: primaryGuest.guestPhone,
        guestEmail: primaryGuest.guestEmail,
        idProofType: primaryGuest.idProofType,
        idProofNumber: primaryGuest.idProofNumber,
        propertyId: form.propertyId,
        roomId: form.roomId || null,
        bedId: form.bedId || null,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numberOfGuests: form.numberOfGuests,
        amount: form.amount,
        discount: form.discount,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        bookingSource: form.bookingSource,
        specialRequests: form.specialRequests,
        notes: form.notes,
      };

      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";
      const method = editingBooking ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(editingBooking ? "Booking updated!" : "Booking created!");
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const finalAmount = (parseFloat(form.amount || "0") - parseFloat(form.discount || "0")).toFixed(2);

  const filtered = bookings.filter(b => {
    const matchSearch = !searchTerm || b.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.guest_phone?.includes(searchTerm) || b.booking_code?.includes(searchTerm);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSource = sourceFilter === "all" || b.booking_source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-50 text-green-700 border border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    checked_in: "bg-blue-50 text-blue-700 border border-blue-200",
    checked_out: "bg-gray-50 text-gray-700 border border-gray-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {success && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"><span>✓</span>{success}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all bookings and reservations</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span className="text-lg">+</span> Add Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bookings", value: bookings.length, icon: "📋" },
          { label: "Today Check-ins", value: bookings.filter(b => b.check_in === new Date().toISOString().split("T")[0]).length, icon: "🏨" },
          { label: "Today Check-outs", value: bookings.filter(b => b.check_out === new Date().toISOString().split("T")[0]).length, icon: "🚪" },
          { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, phone or code..." className="input-field flex-1 min-w-48 text-sm" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm">
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="input-field text-sm">
          <option value="all">All Sources</option>
          {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-sm text-slate-500">{filtered.length} bookings</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No bookings found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Guest", "Property/Bed", "Check-in", "Check-out", "Amount", "Source", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-600 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">{b.guest_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="font-medium text-sm text-slate-800">{b.guest_name}</div>
                        <div className="text-xs text-slate-400">{b.guest_phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{(b as any).property_name || b.property_id}<br/><span className="text-xs text-slate-400">{(b as any).room_name || ""}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(b.check_in)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(b.check_out)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-800">₹{Number(b.amount).toLocaleString("en-IN")}</div>
                    <div className="text-xs text-green-600">{b.payment_status === "paid" ? "Paid" : b.payment_status}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 capitalize">{b.booking_source || "direct"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || statusColor.pending}`}>{b.status?.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {b.status === "confirmed" && <button onClick={() => handleCheckIn(b.id)} title="Check In" className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs flex items-center justify-center">↓</button>}
                      {b.status === "checked_in" && <button onClick={() => handleCheckOut(b.id)} title="Check Out" className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs flex items-center justify-center">↑</button>}
                      <button onClick={() => openEdit(b)} className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs flex items-center justify-center">✏️</button>
                      <button onClick={() => handleDelete(b.id)} className="h-7 w-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs flex items-center justify-center">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`h-8 w-8 rounded-lg text-sm ${currentPage === i + 1 ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editingBooking ? "Edit Booking" : "Add Booking"}</h2>
                <p className="text-xs text-slate-500">{editingBooking ? "Update booking details" : "Create a new booking"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Booking Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 text-xs">🏨</div>
                  <h3 className="text-sm font-bold text-slate-800">Booking Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property *</label>
                    <select required value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className="input-field w-full text-sm">
                      <option value="">Select Property</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Room</label>
                    <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className="input-field w-full text-sm" disabled={!form.propertyId}>
                      <option value="">Select Room</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bed</label>
                    <select value={form.bedId} onChange={e => setForm(f => ({ ...f, bedId: e.target.value }))} className="input-field w-full text-sm" disabled={!form.roomId}>
                      <option value="">Select Bed</option>
                      {beds.map(b => <option key={b.id} value={b.id}>{b.name || `Bed ${b.id}`}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">No. of Guests *</label>
                    <input type="number" min={1} max={10} required value={form.numberOfGuests} onChange={e => handleGuestCountChange(parseInt(e.target.value))} className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-in Date *</label>
                    <input type="date" required value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check-out Date *</label>
                    <input type="date" required value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className="input-field w-full text-sm" />
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 text-xs">👤</div>
                  <h3 className="text-sm font-bold text-slate-800">Guest Details</h3>
                </div>
                <div className="space-y-4">
                  {form.guests.map((g, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-slate-500">Guest {idx + 1}</span>
                        {idx === 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Primary</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                          <input required value={g.guestName} onChange={e => updateGuest(idx, "guestName", e.target.value)} placeholder="Guest name" className="input-field w-full text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone *</label>
                          <input required value={g.guestPhone} onChange={e => updateGuest(idx, "guestPhone", e.target.value)} placeholder="Phone number" className="input-field w-full text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Proof Type</label>
                          <select value={g.idProofType} onChange={e => updateGuest(idx, "idProofType", e.target.value)} className="input-field w-full text-sm">
                            <option value="aadhar">Aadhar Card</option>
                            <option value="passport">Passport</option>
                            <option value="driving_license">Driving License</option>
                            <option value="voter_id">Voter ID</option>
                            <option value="pan">PAN Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID Number *</label>
                          <input required value={g.idProofNumber} onChange={e => updateGuest(idx, "idProofNumber", e.target.value)} placeholder="ID number" className="input-field w-full text-sm" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                          <input type="email" value={g.guestEmail} onChange={e => updateGuest(idx, "guestEmail", e.target.value)} placeholder="Email (optional)" className="input-field w-full text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center text-green-500 text-xs">₹</div>
                  <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₹) *</label>
                    <input type="number" required min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount (₹)</label>
                    <input type="number" min={0} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="input-field w-full text-sm" />
                  </div>
                  <div className="col-span-2 bg-orange-50 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Final Amount</span>
                    <span className="text-lg font-bold text-orange-600">₹{Number(finalAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field w-full text-sm">
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Status</label>
                    <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))} className="input-field w-full text-sm">
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Booking Source</label>
                    <select value={form.bookingSource} onChange={e => setForm(f => ({ ...f, bookingSource: e.target.value as BookingSource }))} className="input-field w-full text-sm">
                      {BOOKING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Special Requests</label>
                    <input value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Any special requests" className="input-field w-full text-sm" />
                  </div>
                </div>
              </div>

              {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3"><p className="text-sm text-red-600 font-medium">{error}</p></div>}

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
    </div>
  );
}
