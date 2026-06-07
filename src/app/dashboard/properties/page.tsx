"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/lib/format";
import type { Property, PropertyType } from "@/types";
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostel" },
  { value: "dorm", label: "Dorm" },
  { value: "guesthouse", label: "Guesthouse" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi",
];

const AMENITIES_OPTIONS = [
  "WiFi", "AC", "Hot Water", "Kitchen", "Laundry", "Parking",
  "24/7 Reception", "Security", "Lockers", "Common Room", "TV",
  "Restaurant", "Cafe", "Gym", "Swimming Pool", "Spa"
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "hostel" as PropertyType,
    address: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    contact: "",
    email: "",
    description: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    amenities: [] as string[],
    policies: "",
    googleMapLink: "",
    upiId: "",
    totalBeds: "",
    status: "active" as "active" | "inactive",
  });

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      if (res.ok) {
        setProperties(data.properties);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  function handleEdit(property: Property) {
    setEditingProperty(property);
    setForm({
      name: property.name,
      type: property.type,
      address: property.address,
      city: property.city,
      state: property.state,
      pincode: property.pincode || "",
      contact: property.contact || "",
      email: property.email || "",
      description: property.description || "",
      checkInTime: property.check_in_time,
      checkOutTime: property.check_out_time,
      amenities: property.amenities || [],
      policies: property.policies || "",
      googleMapLink: property.google_map_link || "",
      upiId: property.upi_id || "",
      totalBeds: String(property.total_beds),
      status: property.status,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProperty(null);
    setForm({
      name: "",
      type: "hostel",
      address: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
      contact: "",
      email: "",
      description: "",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      amenities: [],
      policies: "",
      googleMapLink: "",
      upiId: "",
      totalBeds: "",
      status: "active",
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Property deleted successfully!");
        await fetchProperties();
      } else {
        setError("Failed to delete property");
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
      const url = editingProperty
        ? `/api/properties/${editingProperty.id}`
        : "/api/properties";
      const method = editingProperty ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save property");
        return;
      }

      setSuccess(editingProperty ? "Property updated successfully!" : "Property created successfully!");
      handleCancel();
      await fetchProperties();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleAmenity(amenity: string) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="mt-1 text-slate-600">
            Manage your hotels, hostels, dorms, and guesthouses
          </p>
        </div>
        <button
          onClick={() => {
            if (!showForm) handleCancel();
            setShowForm(!showForm);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {showForm ? "Cancel" : "Add Property"}
        </button>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingProperty ? "Edit Property" : "New Property"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Property Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Backpacker's Inn"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as PropertyType })
                }
                className="input-field"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Address *
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
                placeholder="12 MG Road, Colaba"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                City *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-field"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                State *
              </label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-field"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Pincode
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="input-field"
                placeholder="400001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contact Number
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="contact@backpackersinn.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Total Beds *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.totalBeds}
                onChange={(e) =>
                  setForm({ ...form, totalBeds: e.target.value })
                }
                className="input-field"
                placeholder="24"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Check-in Time
              </label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Check-out Time
              </label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Describe your property..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      form.amenities.includes(amenity)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Policies
              </label>
              <textarea
                value={form.policies}
                onChange={(e) => setForm({ ...form, policies: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="House rules and policies..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Google Map Link
              </label>
              <input
                type="url"
                value={form.googleMapLink}
                onChange={(e) => setForm({ ...form, googleMapLink: e.target.value })}
                className="input-field"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                UPI ID
              </label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="input-field"
                placeholder="yourname@upi"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingProperty ? "Update Property" : "Save Property"}
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
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600">No properties yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first hotel, hostel, or guesthouse to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {property.name}
                  </h3>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    property.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {capitalize(property.type)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(property)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={14} />
                  <span className="truncate">{property.address}</span>
                </div>
                <div className="text-slate-500">
                  {property.city}, {property.state} {property.pincode && `(${property.pincode})`}
                </div>
                {property.contact && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} />
                    <span>{property.contact}</span>
                  </div>
                )}
                {property.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} />
                    <span className="truncate">{property.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={14} />
                  <span>Check-in: {property.check_in_time} | Check-out: {property.check_out_time}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {property.total_beds} beds
                  </span>
                  {property.amenities && property.amenities.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {property.amenities.length} amenities
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
