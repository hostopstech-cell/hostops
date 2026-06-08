"use client";

import { useEffect, useState } from "react";
import { formatDate, capitalize } from "@/lib/format";
import type { Guest, IDType } from "@/types";
import { Search, User, Mail, Phone, MapPin, Calendar, Repeat, Edit, Trash2 } from "lucide-react";

const ID_TYPES: { value: IDType; label: string }[] = [
  { value: "aadhar", label: "Aadhar" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "repeat" | "new">("all");

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
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGuests();
  }, []);

  function handleEdit(guest: Guest) {
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

  const filteredGuests = guests?.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filter === "all" ||
      (filter === "repeat" && guest.total_stays > 1) ||
      (filter === "new" && guest.total_stays === 1);
    
    return matchesSearch && matchesFilter;
  }) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Guests</h1>
          <p className="mt-2 text-slate-600 text-lg">
            Manage guest information and history
          </p>
        </div>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <User size={18} />
          Add Guest
        </button>
      </div>

      {success && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800">{success}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "repeat" | "new")}
            className="input-field w-auto"
          >
            <option value="all">All Guests</option>
            <option value="repeat">Repeat Guests</option>
            <option value="new">New Guests</option>
          </select>
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input-field"
                placeholder="India"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Full address..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ID Type
              </label>
              <select
                value={form.idType}
                onChange={(e) => setForm({ ...form, idType: e.target.value as IDType | "" })}
                className="input-field"
              >
                <option value="">Select ID Type</option>
                {ID_TYPES?.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ID Number
              </label>
              <input
                type="text"
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                className="input-field"
                placeholder="ID number"
              />
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
                {submitting ? "Saving..." : editingGuest ? "Update Guest" : "Save Guest"}
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

      {/* Guests List */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading guests...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="card p-12 text-center bg-gradient-to-br from-orange-50 to-white">
          <div className="h-16 w-16 rounded-2xl icon-bg-orange flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">No guests found</p>
          <p className="text-slate-600 mb-6">
            {searchTerm || filter !== "all"
              ? "Try adjusting your search or filters."
              : "Add your first guest to get started."}
          </p>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <User size={18} />
            Add Guest
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Stats</th>
                  <th className="px-6 py-3">Last Visit</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests?.map((guest) => (
                  <tr
                    key={guest.id}
                    className="table-row"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full icon-bg-orange text-white font-bold text-lg">
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{guest.name}</p>
                            {guest.total_stays > 1 && (
                              <span className="badge-info flex items-center gap-1">
                                <Repeat size={10} />
                                Repeat
                              </span>
                            )}
                          </div>
                          {guest.email && (
                            <p className="text-xs text-slate-500">{guest.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} />
                        <span>{guest.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} />
                        <span>{guest.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {guest.id_type && guest.id_number ? (
                        <div>
                          <p className="text-slate-900">{capitalize(guest.id_type.replace("_", " "))}</p>
                          <p className="text-xs text-slate-500">{guest.id_number}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-slate-900">{guest.total_stays} stays</p>
                        <p className="text-xs text-slate-500">₹{guest.total_spent} total</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {guest.last_visit ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={14} />
                          <span>{formatDate(guest.last_visit)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
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
