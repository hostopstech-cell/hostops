"use client";

import { useEffect, useState } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Booking, BookingStatus, BookingSource, PaymentMethod, Property, Room, Bed } from "@/types";
import { Plus, Edit, Trash2, Search, Calendar, User, ArrowRight } from "lucide-react";

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<BookingSource | "all">("all");

  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    propertyId: "",
    roomId: "",
    bedId: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: "1",
    amount: "",
    discount: "0",
    paymentMethod: "upi" as PaymentMethod,
    paymentStatus: "pending" as "paid" | "pending" | "partial" | "refunded",
    bookingSource: "direct" as BookingSource,
    specialRequests: "",
    notes: "",
  });

  async function fetchData() {
    try {
      const [bookingsRes, propsRes, roomsRes, bedsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/properties"),
        fetch("/api/rooms"),
        fetch("/api/beds"),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings);
      }
      if (propsRes.ok) {
        const data = await propsRes.json();
        setProperties(data.properties);
      }
      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.rooms);
      }
      if (bedsRes.ok) {
        const data = await bedsRes.json();
        setBeds(data.beds);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleEdit(booking: Booking) {
    setEditingBooking(booking);
    setForm({
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone || "",
      guestEmail: booking.guest_email || "",
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
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingBooking(null);
    setForm({
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      propertyId: "",
      roomId: "",
      bedId: "",
      checkIn: "",
      checkOut: "",
      numberOfGuests: "1",
      amount: "",
      discount: "0",
      paymentMethod: "upi",
      paymentStatus: "pending",
      bookingSource: "direct",
      specialRequests: "",
      notes: "",
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Booking deleted successfully!");
        await fetchData();
      } else {
        setError("Failed to delete booking");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleCheckIn(id: number) {
    try {
      const res = await fetch(`/api/bookings/${id}/check-in`, { method: "POST" });
      if (res.ok) {
        setSuccess("Guest checked in successfully!");
        await fetchData();
      } else {
        setError("Failed to check in guest");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleCheckOut(id: number) {
    try {
      const res = await fetch(`/api/bookings/${id}/check-out`, { method: "POST" });
      if (res.ok) {
        setSuccess("Guest checked out successfully!");
        await fetchData();
      } else {
        setError("Failed to check out guest");
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
      const finalAmount = Number(form.amount) - Number(form.discount);
      const bookingCode = editingBooking 
        ? editingBooking.booking_code
        : `BK${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";
      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          finalAmount,
          bookingCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save booking");
        return;
      }

      setSuccess(editingBooking ? "Booking updated successfully!" : "Booking created successfully!");
      handleCancel();
      await fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSource = sourceFilter === "all" || booking.booking_source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  function getStatusColor(status: BookingStatus) {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "confirmed":
        return "bg-blue-50 text-blue-700";
      case "checked_in":
        return "bg-emerald-50 text-emerald-700";
      case "checked_out":
        return "bg-slate-50 text-slate-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  }

  const filteredRooms = form.propertyId ? rooms.filter(r => r.property_id === Number(form.propertyId)) : rooms;
  const filteredBeds = form.roomId ? beds.filter(b => b.room_id === Number(form.roomId)) : beds;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-1 text-slate-600">
            Manage all bookings and reservations
          </p>
        </div>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Booking
        </button>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or booking code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as BookingSource | "all")}
            className="input-field w-auto"
          >
            <option value="all">All Sources</option>
            {BOOKING_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingBooking ? "Edit Booking" : "New Booking"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={form.guestEmail}
                onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Property *
              </label>
              <select
                required
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value, roomId: "", bedId: "" })}
                className="input-field"
              >
                <option value="">Select Property</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Room
              </label>
              <select
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value, bedId: "" })}
                className="input-field"
              >
                <option value="">Select Room</option>
                {filteredRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {capitalize(room.type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Bed
              </label>
              <select
                value={form.bedId}
                onChange={(e) => setForm({ ...form, bedId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Bed</option>
                {filteredBeds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_number} - {capitalize(bed.status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Number of Guests *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.numberOfGuests}
                onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })}
                className="input-field"
                placeholder="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Discount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                className="input-field"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Payment Status
              </label>
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as "paid" | "pending" | "partial" | "refunded" })}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Booking Source
              </label>
              <select
                value={form.bookingSource}
                onChange={(e) => setForm({ ...form, bookingSource: e.target.value as BookingSource })}
                className="input-field"
              >
                {BOOKING_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Special Requests
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Any special requests..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            {error && (
              <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting ? "Saving..." : editingBooking ? "Update Booking" : "Create Booking"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600">No bookings found.</p>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || statusFilter !== "all" || sourceFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first booking to get started."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50">
                  <th className="px-6 py-3 font-medium">Booking Code</th>
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Check-in</th>
                  <th className="px-6 py-3 font-medium">Check-out</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.property_id);
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 font-medium text-orange-600">
                        {booking.booking_code}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{booking.guest_name}</p>
                            {booking.guest_phone && (
                              <p className="text-xs text-slate-500">{booking.guest_phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {property?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {formatDate(booking.check_in)}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {formatDate(booking.check_out)}
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-900">
                        ₹{booking.final_amount}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {capitalize(booking.status.replace("_", " "))}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleCheckIn(booking.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Check In"
                            >
                              <ArrowRight size={16} />
                            </button>
                          )}
                          {booking.status === "checked_in" && (
                            <button
                              onClick={() => handleCheckOut(booking.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Check Out"
                            >
                              <ArrowRight size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(booking)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
