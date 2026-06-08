"use client";

import { useEffect, useState, useRef } from "react";
import { capitalize } from "@/lib/format";
import type { Room, RoomType, Property, Bed, BedType } from "@/types";
import {
  Plus, Edit, Trash2, BedDouble, Search, TrendingUp, CheckCircle,
  Building2, Bed as BedIcon, MoreVertical, ChevronLeft, ChevronRight, X
} from "lucide-react";

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "dorm", label: "Mixed Dorm" },
  { value: "private", label: "Private Room" },
  { value: "deluxe", label: "Deluxe Room" },
  { value: "family", label: "Family Room" },
];

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: "upper", label: "Upper Bunk" },
  { value: "lower", label: "Lower Bunk" },
  { value: "normal", label: "Normal" },
];

const ROOM_COLORS: Record<string, { iconBg: string; iconColor: string; badge: string; badgeText: string; bar: string }> = {
  dorm:    { iconBg: "bg-blue-100",   iconColor: "text-blue-500",   badge: "bg-blue-50 text-blue-600 border-blue-100",     badgeText: "Mixed Dorm",    bar: "bg-blue-400" },
  private: { iconBg: "bg-purple-100", iconColor: "text-purple-500", badge: "bg-purple-50 text-purple-600 border-purple-100", badgeText: "Private Room", bar: "bg-purple-400" },
  deluxe:  { iconBg: "bg-amber-100",  iconColor: "text-amber-500",  badge: "bg-amber-50 text-amber-600 border-amber-100",   badgeText: "Deluxe Room",  bar: "bg-amber-400" },
  family:  { iconBg: "bg-green-100",  iconColor: "text-green-500",  badge: "bg-green-50 text-green-600 border-green-100",   badgeText: "Family Room",  bar: "bg-green-400" },
};

const ITEMS_PER_PAGE = 8;

export default function RoomsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [selectedRoomForBed, setSelectedRoomForBed] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      const [propsRes, roomsRes, bedsRes, bookingsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/rooms"),
        fetch("/api/beds"),
        fetch("/api/bookings"),
      ]);
      if (propsRes.ok) {
        const d = await propsRes.json();
        setProperties(d.properties ?? []);
        if (d.properties?.length > 0 && !selectedProperty) {
          setSelectedProperty(d.properties[0].id);
        }
      }
      if (roomsRes.ok) { const d = await roomsRes.json(); setRooms(d.rooms ?? []); }
      if (bedsRes.ok) { const d = await bedsRes.json(); setBeds(d.beds ?? []); }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings ?? []); }
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  // Close menu on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Auto-dismiss success
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  function getOccupiedForRoom(roomId: number) {
    return bookings.filter(
      (b) => Number(b.room_id) === Number(roomId) && ["confirmed", "checked_in"].includes(b.status)
    ).length;
  }

  function getOccupiedForProperty(propertyId: number) {
    return bookings.filter(
      (b) => Number(b.property_id) === Number(propertyId) && ["confirmed", "checked_in"].includes(b.status)
    ).length;
  }

  // Global stats
  const totalAllBeds = properties.reduce((s, p) => s + (Number(p.total_beds) || 0), 0);
  const totalSoldBeds = properties.reduce((s, p) => s + getOccupiedForProperty(p.id), 0);
  const totalAvailableBeds = Math.max(totalAllBeds - totalSoldBeds, 0);
  const totalRooms = rooms.length;

  // Filtered rooms based on selected property + search
  const filteredRooms = (
    selectedProperty
      ? rooms.filter((r) => Number(r.property_id) === Number(selectedProperty))
      : rooms
  ).filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Beds scoped to selected property
  const scopedBeds = selectedProperty
    ? beds.filter((b) => {
        const room = rooms.find((r) => r.id === b.room_id);
        return Number(room?.property_id) === Number(selectedProperty);
      })
    : beds;

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ---- Handlers ----
  function openAddRoom() {
    setEditingRoom(null);
    setRoomForm({ propertyId: selectedProperty ? String(selectedProperty) : "", name: "", type: "dorm", capacity: "1", pricePerNight: "", status: "available" });
    setError(""); setShowRoomModal(true);
  }

  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomForm({ propertyId: String(room.property_id), name: room.name, type: room.type, capacity: String(room.capacity), pricePerNight: String(room.price_per_night), status: room.status });
    setError(""); setShowRoomModal(true); setOpenMenuId(null);
  }

  function openAddBed(room: Room) {
    setEditingBed(null); setSelectedRoomForBed(room);
    setBedForm({ bedNumber: "", bedType: "normal", pricePerNight: String(room.price_per_night), status: "available" });
    setError(""); setShowBedModal(true); setOpenMenuId(null);
  }

  function openEditBed(bed: Bed) {
    setEditingBed(bed); setSelectedRoomForBed(null);
    setBedForm({ bedNumber: bed.bed_number, bedType: bed.bed_type || "normal", pricePerNight: String(bed.price_per_night), status: bed.status });
    setError(""); setShowBedModal(true);
  }

  async function handleDeleteRoom(id: number) {
    if (!confirm("Delete this room and all its beds?")) return;
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (res.ok) { setSuccess("Room deleted successfully!"); await fetchData(); }
    else setError("Failed to delete room");
    setOpenMenuId(null);
  }

  async function handleDeleteBed(id: number) {
    if (!confirm("Delete this bed?")) return;
    const res = await fetch(`/api/beds/${id}`, { method: "DELETE" });
    if (res.ok) { setSuccess("Bed deleted!"); await fetchData(); }
    else setError("Failed to delete bed");
  }

  async function handleRoomSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(roomForm) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save room"); return; }
      setSuccess(editingRoom ? "Room updated!" : "Room created!");
      setShowRoomModal(false); await fetchData();
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  }

  async function handleBedSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const url = editingBed ? `/api/beds/${editingBed.id}` : "/api/beds";
      const method = editingBed ? "PUT" : "POST";
      const body = editingBed ? bedForm : { ...bedForm, roomId: selectedRoomForBed?.id };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save bed"); return; }
      setSuccess(editingBed ? "Bed updated!" : "Bed added!");
      setShowBedModal(false); await fetchData();
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  }

  function getBedDot(status: string) {
    if (status === "available") return "bg-emerald-500";
    if (status === "occupied") return "bg-red-500";
    if (status === "maintenance") return "bg-yellow-500";
    return "bg-slate-400";
  }

  const selectedPropName = properties.find(p => Number(p.id) === Number(selectedProperty))?.name;

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms & Beds</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage rooms and beds across your properties</p>
        </div>
        <button onClick={openAddRoom} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Properties", value: properties.length,    sub: "Active properties",                               iconBg: "bg-orange-100", iconColor: "text-orange-500", dot: "bg-orange-400", Icon: Building2 },
          { label: "Total Rooms",      value: totalRooms,           sub: "Across all properties",                           iconBg: "bg-blue-100",   iconColor: "text-blue-500",   dot: "bg-blue-400",   Icon: BedDouble },
          { label: "Total Beds",       value: totalAllBeds,         sub: "Across all rooms",                                iconBg: "bg-violet-100", iconColor: "text-violet-500", dot: "bg-violet-400", Icon: BedIcon },
          { label: "Occupied Beds",    value: totalSoldBeds,        sub: `${totalAllBeds > 0 ? Math.round((totalSoldBeds/totalAllBeds)*100) : 0}% Occupied`, iconBg: "bg-red-100",    iconColor: "text-red-500",    dot: "bg-red-400",    Icon: TrendingUp },
          { label: "Available Beds",   value: totalAvailableBeds,   sub: `${totalAllBeds > 0 ? Math.round((totalAvailableBeds/totalAllBeds)*100) : 0}% Available`, iconBg: "bg-emerald-100",iconColor:"text-emerald-500",dot:"bg-emerald-400",Icon: CheckCircle },
        ].slice(0, 4).map(({ label, value, sub, iconBg, iconColor, dot, Icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={17} className={iconColor} />
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1.5">{value}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Property picker */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 min-w-[200px]">
          <Building2 size={15} className="text-orange-500 flex-shrink-0" />
          <select
            value={selectedProperty || ""}
            onChange={(e) => { setSelectedProperty(e.target.value ? Number(e.target.value) : null); setCurrentPage(1); }}
            className="text-sm font-medium text-slate-700 bg-transparent outline-none flex-1 cursor-pointer"
          >
            <option value="">All Properties</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="input-field pl-9 w-full text-sm"
          />
        </div>

        {/* Count badge */}
        {filteredRooms.length > 0 && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Toast ── */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{success}</p>
        </div>
      )}

      {/* ── Rooms Grid ── */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <BedDouble size={32} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">No rooms yet</p>
          <p className="text-sm text-slate-400 mb-6">
            {searchQuery ? "No rooms match your search." : "Add your first room to get started."}
          </p>
          {!searchQuery && (
            <button onClick={openAddRoom} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Add Room
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedRooms.map((room) => {
              const roomBeds = scopedBeds.filter((b) => b.room_id === room.id);
              const occupied = getOccupiedForRoom(room.id);
              const capacity = Number(room.number_of_beds || room.capacity || 0);
              const available = Math.max(capacity - occupied, 0);
              const pct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
              const c = ROOM_COLORS[room.type] || ROOM_COLORS.dorm;
              const isActive = room.status === "available";
              const isExpanded = expandedRoomId === room.id;

              return (
                <div key={room.id} className="card overflow-visible flex flex-col">
                  {/* Card body */}
                  <div className="p-4 flex-1">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <BedDouble size={20} className={c.iconColor} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">{room.name}</h3>
                          <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
                            {ROOM_TYPES.find(t => t.value === room.type)?.label || capitalize(room.type)}
                          </span>
                        </div>
                      </div>

                      {/* Status + 3-dot */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-100 text-emerald-700" : room.status === "maintenance" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                          {isActive ? "Active" : capitalize(room.status)}
                        </span>
                        <div className="relative" ref={openMenuId === room.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === room.id ? null : room.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === room.id && (
                            <div className="absolute right-0 top-8 z-30 w-38 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[148px]">
                              <button onClick={() => openEditRoom(room)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                                <Edit size={13} className="text-slate-400" /> Edit Room
                              </button>
                              <button onClick={() => openAddBed(room)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                                <Plus size={13} className="text-slate-400" /> Add Bed
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button onClick={() => handleDeleteRoom(room.id)} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5">
                                <Trash2 size={13} /> Delete Room
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bed counts */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-slate-800">{capacity}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Total Beds</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-red-500">{occupied}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Occupied</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-emerald-500">{available}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Available</p>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Occupancy</span>
                        <span className={`text-[10px] font-bold ${pct >= 80 ? "text-red-500" : pct >= 50 ? "text-orange-500" : "text-emerald-500"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-orange-400" : "bg-emerald-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1.5"
                    >
                      <BedIcon size={12} />
                      {isExpanded ? "Hide Beds" : `View Beds (${roomBeds.length})`}
                    </button>
                    <button
                      onClick={() => openEditRoom(room)}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                    >
                      <Edit size={11} /> Edit
                    </button>
                  </div>

                  {/* Expanded beds */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/70">
                      {roomBeds.length === 0 ? (
                        <div className="text-center py-3">
                          <p className="text-xs text-slate-400 mb-2">No beds added yet</p>
                          <button onClick={() => openAddBed(room)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 mx-auto">
                            <Plus size={11} /> Add first bed
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {roomBeds.map((bed) => (
                              <div key={bed.id} className="group/bed bg-white border border-slate-100 rounded-lg p-2 hover:border-orange-200 hover:shadow-sm transition-all">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-slate-800">{bed.bed_number}</span>
                                  <div className="flex gap-0.5 opacity-0 group-hover/bed:opacity-100 transition-opacity">
                                    <button onClick={() => openEditBed(bed)} className="p-0.5 text-slate-300 hover:text-orange-500 rounded"><Edit size={9} /></button>
                                    <button onClick={() => handleDeleteBed(bed.id)} className="p-0.5 text-slate-300 hover:text-red-500 rounded"><Trash2 size={9} /></button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getBedDot(bed.status)}`} />
                                  <span className="text-[9px] text-slate-400 capitalize">{bed.status}</span>
                                </div>
                                <p className="text-[10px] font-bold text-orange-500">₹{bed.price_per_night}</p>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => openAddBed(room)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                            <Plus size={11} /> Add Bed
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500">
              Showing {filteredRooms.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${currentPage === page ? "bg-orange-500 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          ROOM MODAL
      ══════════════════════════════════════ */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRoomModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingRoom ? "Edit Room" : "Add New Room"}</h2>
              <button onClick={() => setShowRoomModal(false)} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Property *</label>
                <select required value={roomForm.propertyId} onChange={(e) => setRoomForm({ ...roomForm, propertyId: e.target.value })} className="input-field w-full">
                  <option value="">Select Property</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Name *</label>
                <input type="text" required placeholder="e.g. Dorm A" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type *</label>
                  <select value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as RoomType })} className="input-field w-full">
                    {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity *</label>
                  <input type="number" required min={1} placeholder="4" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price/Night (₹) *</label>
                  <input type="number" required min={0} placeholder="500" value={roomForm.pricePerNight} onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={roomForm.status} onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })} className="input-field w-full">
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? "Saving..." : editingRoom ? "Update Room" : "Add Room"}
                </button>
                <button type="button" onClick={() => setShowRoomModal(false)} className="btn-secondary px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BED MODAL
      ══════════════════════════════════════ */}
      {showBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBedModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingBed ? "Edit Bed" : "Add Bed"}</h2>
                {selectedRoomForBed && <p className="text-xs text-slate-400 mt-0.5">to {selectedRoomForBed.name}</p>}
              </div>
              <button onClick={() => setShowBedModal(false)} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBedSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bed Number *</label>
                  <input type="text" required placeholder="B1" value={bedForm.bedNumber} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bed Type</label>
                  <select value={bedForm.bedType} onChange={(e) => setBedForm({ ...bedForm, bedType: e.target.value as BedType })} className="input-field w-full">
                    {BED_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price/Night (₹) *</label>
                  <input type="number" required min={0} placeholder="150" value={bedForm.pricePerNight} onChange={(e) => setBedForm({ ...bedForm, pricePerNight: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={bedForm.status} onChange={(e) => setBedForm({ ...bedForm, status: e.target.value as any })} className="input-field w-full">
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? "Saving..." : editingBed ? "Update Bed" : "Add Bed"}
                </button>
                <button type="button" onClick={() => setShowBedModal(false)} className="btn-secondary px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
