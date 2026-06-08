"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/lib/format";
import type { Room, RoomType, Property, Bed, BedType } from "@/types";
import { Plus, Edit, Trash2, BedDouble, MapPin, Building2 } from "lucide-react";

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "dorm", label: "Dorm" },
  { value: "private", label: "Private Room" },
  { value: "deluxe", label: "Deluxe Room" }, { value: "family", label: "Family Room" },
];

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
  { value: "normal", label: "Normal" },
];

export default function RoomsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [selectedRoomForBed, setSelectedRoomForBed] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [roomForm, setRoomForm] = useState({
    propertyId: "",
    name: "",
    type: "dorm" as RoomType,
    capacity: "1",
    pricePerNight: "",
    status: "available" as "available" | "maintenance" | "inactive",
  });

  const [bedForm, setBedForm] = useState({
    bedNumber: "",
    bedType: "normal" as BedType,
    pricePerNight: "",
    status: "available" as "available" | "occupied" | "maintenance",
  });

  async function fetchData() {
    try {
      const [propsRes, roomsRes, bedsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/rooms"),
        fetch("/api/beds"),
      ]);

      if (propsRes.ok) {
        const propsData = await propsRes.json();
        setProperties(propsData.properties);
        if (propsData.properties.length > 0 && !selectedProperty) {
          setSelectedProperty(propsData.properties[0].id);
        }
      }
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms);
      }
      if (bedsRes.ok) {
        const bedsData = await bedsRes.json();
        setBeds(bedsData.beds);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomForm({
      propertyId: String(room.property_id),
      name: room.name,
      type: room.type,
      capacity: String(room.capacity),
      pricePerNight: String(room.price_per_night),
      status: room.status,
    });
    setShowRoomForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancelRoomForm() {
    setShowRoomForm(false);
    setEditingRoom(null);
    setRoomForm({
      propertyId: selectedProperty ? String(selectedProperty) : "",
      name: "",
      type: "dorm",
      capacity: "1",
      pricePerNight: "",
      status: "available",
    });
    setError("");
    setSuccess("");
  }

  function handleAddBed(room: Room) {
    setSelectedRoomForBed(room);
    setBedForm({
      bedNumber: "",
      bedType: "normal",
      pricePerNight: String(room.price_per_night),
      status: "available",
    });
    setShowBedForm(true);
    setError("");
    setSuccess("");
  }

  function handleEditBed(bed: Bed) {
    setEditingBed(bed);
    setBedForm({
      bedNumber: bed.bed_number,
      bedType: bed.bed_type || "normal",
      pricePerNight: String(bed.price_per_night),
      status: bed.status,
    });
    setShowBedForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancelBedForm() {
    setShowBedForm(false);
    setEditingBed(null);
    setSelectedRoomForBed(null);
    setBedForm({
      bedNumber: "",
      bedType: "normal",
      pricePerNight: "",
      status: "available",
    });
    setError("");
    setSuccess("");
  }

  async function handleDeleteRoom(id: number) {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Room deleted successfully!");
        await fetchData();
      } else {
        setError("Failed to delete room");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleDeleteBed(id: number) {
    if (!confirm("Are you sure you want to delete this bed?")) return;

    try {
      const res = await fetch(`/api/beds/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Bed deleted successfully!");
        await fetchData();
      } else {
        setError("Failed to delete bed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleRoomSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save room");
        return;
      }

      setSuccess(editingRoom ? "Room updated successfully!" : "Room created successfully!");
      handleCancelRoomForm();
      await fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBedSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const url = editingBed ? `/api/beds/${editingBed.id}` : "/api/beds";
      const method = editingBed ? "PUT" : "POST";

      const body = editingBed
        ? bedForm
        : { ...bedForm, roomId: selectedRoomForBed?.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save bed");
        return;
      }

      setSuccess(editingBed ? "Bed updated successfully!" : "Bed created successfully!");
      handleCancelBedForm();
      await fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredRooms = selectedProperty
    ? rooms?.filter((r) => r.property_id === selectedProperty) ?? []
    : rooms ?? [];

  const filteredBeds = selectedProperty
    ? beds?.filter((b) => {
        const room = rooms?.find((r) => r.id === b.room_id);
        return room?.property_id === selectedProperty;
      }) ?? []
    : beds ?? [];

  // Calculate remaining beds for selected property
  const selectedPropertyData = selectedProperty
    ? properties.find((p) => p.id === selectedProperty)
    : null;
  const totalBedsLimit = selectedPropertyData?.total_beds || 0;
  const currentBedCount = filteredBeds.length;
  const remainingBeds = Math.max(totalBedsLimit - currentBedCount, 0);
  
  // Calculate bed status counts
  const bookedBeds = filteredBeds?.filter((b) => b.status === 'occupied').length ?? 0;
  const availableBeds = filteredBeds?.filter((b) => b.status === 'available').length ?? 0;
  const maintenanceBeds = filteredBeds?.filter((b) => b.status === 'maintenance').length ?? 0;
  
  // Calculate total room capacity (for reference only, not for limit)
  const totalRoomBeds = filteredRooms?.reduce((sum, room) => sum + (Number(room.number_of_beds) || 0), 0) ?? 0;
  const roomCount = filteredRooms.length;
  const bedUsagePercent = totalBedsLimit > 0 ? (totalRoomBeds / totalBedsLimit) * 100 : 0;

  // Calculate room sequential numbering per property
  const getRoomNumber = (roomId: number, propertyId: number) => {
    const propertyRooms = filteredRooms?.filter(r => r.property_id === propertyId) ?? [];
    const index = propertyRooms.findIndex(r => r.id === roomId);
    return index + 1;
  };

  function getBedStatusColor(status: string) {
    switch (status) {
      case "available":
        return "bg-emerald-500";
      case "occupied":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-slate-500";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rooms & Beds</h1>
          <p className="mt-2 text-slate-600 text-lg">
            Manage rooms and beds across your properties
          </p>
        </div>
      </div>

      {success && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800">{success}</p>
        </div>
      )}

      {/* Property Filter */}
      <div className="card p-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select Property
        </label>
        <select
          value={selectedProperty || ""}
          onChange={(e) => setSelectedProperty(Number(e.target.value))}
          className="input-field max-w-xs"
        >
          <option value="">All Properties</option>
          {properties?.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
        {selectedPropertyData && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Beds Used</p>
                <p className="text-xs text-slate-500">{selectedPropertyData.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {totalRoomBeds} / {totalBedsLimit}
                </p>
                <p className={`text-sm font-semibold ${
                  bedUsagePercent >= 100 ? 'text-red-600' :
                  bedUsagePercent >= 80 ? 'text-orange-600' :
                  'text-emerald-600'
                }`}>
                  {bedUsagePercent >= 100 ? 'Limit reached!' :
                   bedUsagePercent >= 80 ? 'Near limit' :
                   'On track'}
                </p>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  bedUsagePercent >= 100 ? 'bg-red-500' :
                  bedUsagePercent >= 80 ? 'bg-orange-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(bedUsagePercent, 100)}%` }}
              />
            </div>
            {bedUsagePercent >= 100 && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                ⚠️ All {totalBedsLimit} beds are allocated. Cannot add more rooms.
              </p>
            )}
            <div className="mt-3 text-xs text-slate-600 flex flex-wrap gap-2">
              <span className="font-semibold">Summary:</span>
              <span>Beds Used: {totalRoomBeds}</span>
              <span>|</span>
              <span>Available: {totalBedsLimit - totalRoomBeds}</span>
              <span>|</span>
              <span>Property Limit: {totalBedsLimit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Room Form */}
      {showRoomForm && (
        <div className="card-premium p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingRoom ? "Edit Room" : "New Room"}
          </h2>
          <form onSubmit={handleRoomSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Property *
              </label>
              <select
                required
                value={roomForm.propertyId}
                onChange={(e) => setRoomForm({ ...roomForm, propertyId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Property</option>
                {properties?.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                className="input-field"
                placeholder="Dorm A"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Type *
              </label>
              <select
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as RoomType })}
                className="input-field"
              >
                {ROOM_TYPES?.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Capacity *
              </label>
              <input
                type="number"
                required
                min={1}
                max={totalBedsLimit - totalRoomBeds}
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                className="input-field"
                placeholder="4"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Price Per Night (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={roomForm.pricePerNight}
                onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                className="input-field"
                placeholder="500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as "available" | "maintenance" | "inactive" })}
                className="input-field"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
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
                {submitting ? "Saving..." : editingRoom ? "Update Room" : "Save Room"}
              </button>
              <button
                type="button"
                onClick={handleCancelRoomForm}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bed Form */}
      {showBedForm && (
        <div className="card-premium p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingBed ? "Edit Bed" : `Add Bed to ${selectedRoomForBed?.name}`}
          </h2>
          <form onSubmit={handleBedSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Bed Number *
              </label>
              <input
                type="text"
                required
                value={bedForm.bedNumber}
                onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
                className="input-field"
                placeholder="B1"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Bed Type
              </label>
              <select
                value={bedForm.bedType}
                onChange={(e) => setBedForm({ ...bedForm, bedType: e.target.value as BedType })}
                className="input-field"
              >
                {BED_TYPES?.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Price Per Night (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={bedForm.pricePerNight}
                onChange={(e) => setBedForm({ ...bedForm, pricePerNight: e.target.value })}
                className="input-field"
                placeholder="150"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={bedForm.status}
                onChange={(e) => setBedForm({ ...bedForm, status: e.target.value as "available" | "occupied" | "maintenance" })}
                className="input-field"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
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
                {submitting ? "Saving..." : editingBed ? "Update Bed" : "Save Bed"}
              </button>
              <button
                type="button"
                onClick={handleCancelBedForm}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Room Button */}
      <button
        onClick={() => {
          setRoomForm({
            propertyId: selectedProperty ? String(selectedProperty) : "",
            name: "",
            type: "dorm",
            capacity: "1",
            pricePerNight: "",
            status: "available",
          });
          setShowRoomForm(true);
          setError("");
          setSuccess("");
        }}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={18} />
        Add Room
      </button>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card p-12 text-center bg-gradient-to-br from-orange-50 to-white">
          <div className="h-16 w-16 rounded-2xl icon-bg-orange flex items-center justify-center mx-auto mb-4">
            <BedDouble size={32} />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">No rooms yet</p>
          <p className="text-slate-600 mb-6">
            Add your first room to get started.
          </p>
          <button
            onClick={() => {
              setRoomForm({
                propertyId: selectedProperty ? String(selectedProperty) : "",
                name: "",
                type: "dorm",
                capacity: "1",
                pricePerNight: "",
                status: "available",
              });
              setShowRoomForm(true);
              setError("");
              setSuccess("");
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Room
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRooms?.map((room) => {
            const roomBeds = filteredBeds?.filter((b) => b.room_id === room.id) ?? [];
            return (
              <div key={room.id} className="card-premium p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
                        <BedDouble size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Room {getRoomNumber(room.id, room.property_id)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                          <span className="badge-info">
                            {capitalize(room.type)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium">Capacity: {room.capacity}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-orange-600">₹{room.price_per_night}/night</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      room.status === 'available' ? 'badge-success' : 
                      room.status === 'maintenance' ? 'badge-warning' : 
                      'bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold'
                    }`}>
                      {capitalize(room.status)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Beds Grid */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Beds ({roomBeds.length})
                    </h4>
                    {currentBedCount >= totalBedsLimit ? (
                      <span className="text-sm font-semibold text-red-600">
                        Bed limit reached ({currentBedCount}/{totalBedsLimit})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddBed(room)}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                      >
                        + Add Bed
                      </button>
                    )}
                  </div>

                  {roomBeds.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No beds in this room yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {roomBeds?.map((bed) => (
                        <div
                          key={bed.id}
                          className="relative p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-base font-bold text-slate-900">
                              {bed.bed_number}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditBed(bed)}
                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBed(bed.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getBedStatusColor(bed.status)}`} />
                            <span className="text-xs font-semibold text-slate-700">
                              {capitalize(bed.status)}
                            </span>
                          </div>
                          {bed.bed_type && (
                            <p className="text-xs text-slate-500 mb-1">
                              {capitalize(bed.bed_type)}
                            </p>
                          )}
                          <p className="text-sm font-bold text-orange-600">
                            ₹{bed.price_per_night}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
