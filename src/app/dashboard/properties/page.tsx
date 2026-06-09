"use client";

import { useEffect, useState, useRef } from "react";
import { capitalize } from "@/lib/format";
import type { Property, PropertyType } from "@/types";
import {
  Plus, Edit, Trash2, MapPin, Phone, Clock, Building2,
  Search, Camera, X, Upload, ChevronLeft, ChevronRight,
  Bed, CheckCircle, TrendingUp,
} from "lucide-react";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostel" },
  { value: "dorm", label: "Dorm" },
  { value: "guesthouse", label: "Guesthouse" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
];

const AMENITIES_OPTIONS = [
  "WiFi","AC","Hot Water","Kitchen","Laundry","Parking",
  "24/7 Reception","Security","Lockers","Common Room","TV",
  "Restaurant","Cafe","Gym","Swimming Pool","Spa",
];

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect width='400' height='220' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageSlides, setImageSlides] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", type: "hostel" as PropertyType, address: "", city: "",
    state: "Maharashtra", pincode: "", contact: "", email: "",
    description: "", checkInTime: "14:00", checkOutTime: "11:00",
    amenities: [] as string[], policies: "", googleMapLink: "",
    upiId: "", totalBeds: "", status: "active" as "active" | "inactive",
    images: [] as string[],
  });

  async function fetchData() {
    try {
      const [propsRes, bookingsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/bookings"),
      ]);
      if (propsRes.ok) { const d = await propsRes.json(); setProperties(d.properties); }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings || []); }
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  function getSoldBeds(propertyId: number) {
    return bookings.filter(
      (b) => Number(b.property_id) === Number(propertyId) && ["confirmed", "checked_in"].includes(b.status)
    ).length;
  }

  function getOccupancyPct(propertyId: number, totalBeds: number) {
    if (!totalBeds) return 0;
    return Math.round((getSoldBeds(propertyId) / totalBeds) * 100);
  }

  async function handleImageUpload(files: FileList) {
    if (previewImages.length + files.length > 6) { setError("Maximum 6 images allowed"); return; }
    setUploadingImages(true); setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/properties/upload-image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push(data.url);
      }
      const newImages = [...previewImages, ...uploaded];
      setPreviewImages(newImages);
      setForm(prev => ({ ...prev, images: newImages }));
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally { setUploadingImages(false); }
  }

  function removeImage(idx: number) {
    const updated = previewImages.filter((_, i) => i !== idx);
    setPreviewImages(updated);
    setForm(prev => ({ ...prev, images: updated }));
  }

  function handleEdit(property: Property) {
    setEditingProperty(property);
    const imgs = (property as any).images || [];
    setPreviewImages(imgs);
    setForm({
      name: property.name, type: property.type, address: property.address,
      city: property.city, state: property.state, pincode: property.pincode || "",
      contact: property.contact || "", email: property.email || "",
      description: property.description || "", checkInTime: property.check_in_time,
      checkOutTime: property.check_out_time, amenities: property.amenities || [],
      policies: property.policies || "", googleMapLink: property.google_map_link || "",
      upiId: property.upi_id || "", totalBeds: String(property.total_beds),
      status: property.status, images: imgs,
    });
    setShowForm(true); setError(""); setSuccess("");
  }

  function handleCancel() {
    setShowForm(false); setEditingProperty(null); setPreviewImages([]);
    setForm({
      name: "", type: "hostel", address: "", city: "", state: "Maharashtra",
      pincode: "", contact: "", email: "", description: "",
      checkInTime: "14:00", checkOutTime: "11:00", amenities: [],
      policies: "", googleMapLink: "", upiId: "", totalBeds: "",
      status: "active", images: [],
    });
    setError(""); setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) { setSuccess("Property deleted!"); await fetchData(); }
      else setError("Failed to delete property");
    } catch { setError("Network error. Please try again."); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess(""); setSubmitting(true);
    try {
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : "/api/properties";
      const method = editingProperty ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save property"); return; }
      if (editingProperty) {
        await fetch(`/api/properties/${editingProperty.id}/images`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: previewImages }),
        });
      }
      setSuccess(editingProperty ? "Property updated!" : "Property created!");
      handleCancel(); await fetchData();
    } catch { setError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  function toggleAmenity(amenity: string) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  function slideNext(propertyId: number, total: number) {
    setImageSlides(prev => ({ ...prev, [propertyId]: ((prev[propertyId] || 0) + 1) % total }));
  }
  function slidePrev(propertyId: number, total: number) {
    setImageSlides(prev => ({ ...prev, [propertyId]: ((prev[propertyId] || 0) - 1 + total) % total }));
  }

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBeds = properties.reduce((s, p) => s + (p.total_beds || 0), 0);
  const totalSold = properties.reduce((s, p) => s + getSoldBeds(p.id), 0);
  const totalAvailable = totalBeds - totalSold;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
          <p className="mt-1 text-slate-500">Manage your hotels, hostels, dorms, and guesthouses</p>
        </div>
        <button
          onClick={() => { if (!showForm) handleCancel(); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          {showForm ? "Cancel" : "Add Property"}
        </button>
      </div>

      {/* Stats Bar */}
      {!showForm && properties.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Properties", value: properties.length, icon: Building2, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Beds", value: totalBeds, icon: Bed, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Occupied", value: totalSold, icon: TrendingUp, color: "text-red-500", bg: "bg-red-50" },
            { label: "Available", value: totalAvailable, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!showForm && properties.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search properties..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">✓ {success}</p>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="card-premium p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingProperty ? "Edit Property" : "Add New Property"}
          </h2>
          {/* Image Upload */}
                  {uploadingImages
                    ? <div className="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    : <><Upload size={18} className="text-slate-400 mb-1" /><span className="text-xs text-slate-400">Upload</span></>
                  }
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple className="hidden"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
            <p className="text-xs text-slate-400">JPG, PNG or WebP • Max 5MB each • First image is cover photo</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Property Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Backpacker's Inn" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })} className="input-field">
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Address *</label>
                <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="12 MG Road, Colaba" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">City *</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Mumbai" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">State *</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field">
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Pincode</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" placeholder="400001" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Contact Number</label>
                <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="contact@property.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Total Beds *</label>
                <input type="number" required min={1} value={form.totalBeds} onChange={(e) => setForm({ ...form, totalBeds: e.target.value })} className="input-field" placeholder="24" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Check-in Time</label>
                <input type="time" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Check-out Time</label>
                <input type="time" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Describe your property..." />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-3 block text-sm font-semibold text-slate-700">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${form.amenities.includes(amenity) ? "border-orange-500 bg-orange-50 text-orange-700 font-medium" : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Policies</label>
                <textarea value={form.policies} onChange={(e) => setForm({ ...form, policies: e.target.value })} className="input-field" rows={2} placeholder="House rules and policies..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Google Map Link</label>
                <input type="url" value={form.googleMapLink} onChange={(e) => setForm({ ...form, googleMapLink: e.target.value })} className="input-field" placeholder="https://maps.google.com/..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">UPI ID</label>
                <input type="text" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} className="input-field" placeholder="yourname@upi" />
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={submitting || uploadingImages} className="btn-primary disabled:opacity-60">
                {submitting ? "Saving..." : editingProperty ? "Update Property" : "Save Property"}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="card p-16 text-center bg-gradient-to-br from-orange-50 to-white">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-5">
            <Building2 size={32} className="text-orange-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">No properties yet</p>
          <p className="text-slate-500 mb-6">Add your first property to get started.</p>
          <button onClick={() => { handleCancel(); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Add Property
          </button>
        </div>
      ) : (
        <>
          {filteredProperties.length === 0 && searchQuery && (
            <div className="card p-8 text-center">
              <p className="text-slate-500">No properties found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const soldBeds = getSoldBeds(property.id);
              const totalBeds = property.total_beds || 0;
              const availableBeds = totalBeds - soldBeds;
              const occupancyPct = getOccupancyPct(property.id, totalBeds);
              const images: string[] = (property as any).images || [];
              const currentSlide = imageSlides[property.id] || 0;
              const coverImage = images.length > 0 ? images[currentSlide] : PLACEHOLDER;
              const hasImages = images.length > 0;

              return (
                <div key={property.id} className="card-premium overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={coverImage} alt={property.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${property.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                        {property.status === "active" ? "● Active" : "○ Inactive"}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button onClick={() => handleEdit(property)} className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-white transition-all shadow-sm">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(property.id)} className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-red-600 hover:bg-white transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {hasImages && images.length > 1 && (
                      <>
                        <button onClick={() => slidePrev(property.id, images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all">
                          <ChevronLeft size={14} />
                        </button>
                        <button onClick={() => slideNext(property.id, images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all">
                          <ChevronRight size={14} />
                        </button>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                    {!hasImages && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                        <Camera size={28} className="text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400">No photos yet</p>
                        <button onClick={() => handleEdit(property)} className="mt-2 text-xs text-orange-500 font-semibold hover:underline">+ Add photos</button>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-16">
                      <p className="text-white font-bold text-lg leading-tight drop-shadow-sm line-clamp-1">{property.name}</p>
                      <p className="text-white/80 text-xs font-medium">{capitalize(property.type)}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-500 leading-tight">{property.address}, {property.city}, {property.state}</p>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600">Occupancy</span>
                        <span className={`text-sm font-bold ${occupancyPct >= 80 ? "text-red-500" : occupancyPct >= 50 ? "text-orange-500" : "text-emerald-500"}`}>{occupancyPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${occupancyPct >= 80 ? "bg-red-500" : occupancyPct >= 50 ? "bg-orange-500" : "bg-emerald-500"}`} style={{ width: `${occupancyPct}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Total", value: totalBeds, cls: "bg-slate-50 text-slate-800" },
                        { label: "Occupied", value: soldBeds, cls: "bg-red-50 text-red-600" },
                        { label: "Available", value: availableBeds, cls: "bg-emerald-50 text-emerald-600" },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className={`rounded-xl p-3 text-center ${cls.split(" ")[0]}`}>
                          <p className={`text-lg font-bold ${cls.split(" ")[1]}`}>{value}</p>
                          <p className="text-xs text-slate-400 font-medium">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {property.contact && <span className="flex items-center gap-1"><Phone size={11} />{property.contact}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} />{property.check_in_time} – {property.check_out_time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
