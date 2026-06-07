"use client";

import { useEffect, useState } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Payment, PaymentMethod, PaymentStatus } from "@/types";
import { Plus, Edit, Trash2, CreditCard, Calendar, Search, TrendingUp } from "lucide-react";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "refunded", label: "Refunded" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  const [form, setForm] = useState({
    bookingId: "",
    guestName: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "upi" as PaymentMethod,
    status: "paid" as PaymentStatus,
    notes: "",
  });

  const [summary, setSummary] = useState({
    todayCollection: 0,
    monthlyCollection: 0,
    pendingAmount: 0,
  });

  async function fetchPayments() {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments);
        setSummary(data.summary || { todayCollection: 0, monthlyCollection: 0, pendingAmount: 0 });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  function handleEdit(payment: Payment) {
    setEditingPayment(payment);
    setForm({
      bookingId: String(payment.booking_id),
      guestName: payment.guest_name,
      amount: String(payment.amount),
      date: payment.date,
      method: payment.method,
      status: payment.status,
      notes: payment.notes || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingPayment(null);
    setForm({
      bookingId: "",
      guestName: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "upi",
      status: "paid",
      notes: "",
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Payment deleted successfully!");
        await fetchPayments();
      } else {
        setError("Failed to delete payment");
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
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : "/api/payments";
      const method = editingPayment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save payment");
        return;
      }

      setSuccess(editingPayment ? "Payment updated successfully!" : "Payment created successfully!");
      handleCancel();
      await fetchPayments();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.booking_id).includes(searchTerm);
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function getStatusColor(status: PaymentStatus) {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "partial":
        return "bg-blue-50 text-blue-700";
      case "refunded":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="mt-2 text-slate-600 text-lg">
            Track all payments and collections
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
          Add Payment
        </button>
      </div>

      {success && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800">{success}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-green flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{summary.todayCollection.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Today's collection</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{summary.monthlyCollection.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">This month</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{summary.pendingAmount.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Pending amount</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by guest name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Form */}
      {showForm && (
        <div className="card-premium p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingPayment ? "Edit Payment" : "New Payment"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Booking ID *
              </label>
              <input
                type="text"
                required
                value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                className="input-field"
                placeholder="1"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Method *
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
                className="input-field"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
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
              <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting ? "Saving..." : editingPayment ? "Update Payment" : "Save Payment"}
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

      {/* Payments List */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payments...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="card p-12 text-center bg-gradient-to-br from-orange-50 to-white">
          <div className="h-16 w-16 rounded-2xl icon-bg-orange flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">No payments found</p>
          <p className="text-slate-600 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Add your first payment to get started."}
          </p>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Booking ID</th>
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="table-row"
                  >
                    <td className="px-6 py-3 font-medium text-orange-600">
                      #{payment.booking_id}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {payment.guest_name}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {capitalize(payment.method)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`${
                        payment.status === 'paid' ? 'badge-success' :
                        payment.status === 'pending' ? 'badge-warning' :
                        payment.status === 'partial' ? 'badge-info' :
                        payment.status === 'refunded' ? 'badge-error' :
                        'bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold'
                      }`}>
                        {capitalize(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
