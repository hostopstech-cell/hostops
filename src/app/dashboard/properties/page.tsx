"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/lib/format";
import type { Property, PropertyType } from "@/types";

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "hostel" as PropertyType,
    address: "",
    city: "",
    state: "Maharashtra",
    totalBeds: "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          address: form.address,
          city: form.city,
          state: form.state,
          totalBeds: form.totalBeds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create property");
        return;
      }

      setSuccess("Property created successfully!");
      setForm({
        name: "",
        type: "hostel",
        address: "",
        city: "",
        state: "Maharashtra",
        totalBeds: "",
      });
      setShowForm(false);
      await fetchProperties();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
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
            New Property
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Property Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Backpacker's Inn"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as PropertyType })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                Address
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="12 MG Road, Colaba"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                State
              </label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                Total Beds
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.totalBeds}
                onChange={(e) =>
                  setForm({ ...form, totalBeds: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="24"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Property"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">No properties yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first hotel, hostel, or guesthouse to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {property.name}
                  </h3>
                  <span className="mt-1 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    {capitalize(property.type)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{property.address}</p>
              <p className="text-sm text-slate-500">
                {property.city}, {property.state}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {property.total_beds} beds
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
