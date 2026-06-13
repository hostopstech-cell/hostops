"use client";

import { useEffect, useState, useRef } from "react";
import { capitalize } from "@/lib/format";
import type { Room, RoomType, Property } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import {
  Plus, Edit, Trash2, BedDouble, Search, TrendingUp, CheckCircle,
  Building2, Bed as BedIcon, MoreVertical, ChevronLeft, ChevronRight, X,
  LayoutGrid, List, ChevronDown, Hash,
} from "lucide-react";

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "private", label: "Private Room" },
  { value: "deluxe", label: "Deluxe Room" },
  { value: "female_dorm", label: "Suite" },
  { value: "dorm", label: "Dormitory" },
  { value: "family", label: "Studio Apartment" },
  { value: "male_dorm", label: "Entire Property" },
];

const ROOM_CONFIG: Record<string, { bg: string; bar: string; badge: string; illustration: React.ReactNode }> = {
  dorm: {
    bg: "from-blue-50 to-indigo-50", bar: "bg-blue-500", badge: "bg-blue-100 text-blue-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="50" cy="52" r="44" fill="#DBEAFE" opacity="0.7"/><rect x="18" y="15" width="6" height="72" rx="3" fill="#3B82F6"/><rect x="66" y="15" width="6" height="72" rx="3" fill="#3B82F6"/><rect x="16" y="14" width="58" height="7" rx="3.5" fill="#60A5FA"/><rect x="16" y="46" width="58" height="6" rx="3" fill="#60A5FA"/><rect x="16" y="80" width="58" height="6" rx="3" fill="#60A5FA"/><rect x="22" y="22" width="46" height="22" rx="4" fill="#EFF6FF"/><rect x="24" y="24" width="42" height="18" rx="3" fill="#BFDBFE"/><rect x="26" y="26" width="14" height="10" rx="3" fill="white" opacity="0.9"/><rect x="22" y="54" width="46" height="22" rx="4" fill="#EFF6FF"/><rect x="24" y="56" width="42" height="18" rx="3" fill="#BFDBFE"/><rect x="26" y="58" width="14" height="10" rx="3" fill="white" opacity="0.9"/></svg>),
  },
  private: {
    bg: "from-violet-50 to-purple-50", bar: "bg-violet-500", badge: "bg-violet-100 text-violet-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="52" cy="54" r="42" fill="#EDE9FE" opacity="0.7"/><rect x="12" y="28" width="76" height="30" rx="8" fill="#C4B5FD"/><rect x="16" y="32" width="68" height="22" rx="6" fill="#DDD6FE"/><circle cx="30" cy="43" r="5" fill="#A78BFA"/><circle cx="50" cy="43" r="5" fill="#A78BFA"/><circle cx="70" cy="43" r="5" fill="#A78BFA"/><rect x="8" y="54" width="84" height="30" rx="6" fill="#DDD6FE"/><rect x="12" y="50" width="76" height="24" rx="5" fill="#EDE9FE"/><rect x="14" y="52" width="72" height="20" rx="4" fill="#F5F3FF"/><rect x="16" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/><rect x="60" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/><rect x="14" y="80" width="6" height="12" rx="3" fill="#7C3AED"/><rect x="80" y="80" width="6" height="12" rx="3" fill="#7C3AED"/></svg>),
  },
  deluxe: {
    bg: "from-amber-50 to-yellow-50", bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="54" cy="56" r="42" fill="#FEF3C7" opacity="0.8"/><path d="M10 55 Q10 30 30 30 L80 30 Q100 30 100 55 Z" fill="#F59E0B"/><path d="M14 55 Q14 34 30 34 L80 34 Q96 34 96 55 Z" fill="#FCD34D"/><circle cx="55" cy="26" r="6" fill="#F59E0B"/><rect x="10" y="52" width="90" height="26" rx="5" fill="#FFFBEB"/><rect x="14" y="56" width="26" height="16" rx="5" fill="white" opacity="0.95"/><rect x="70" y="56" width="26" height="16" rx="5" fill="white" opacity="0.95"/><rect x="8" y="74" width="94" height="14" rx="5" fill="#FDE68A"/></svg>),
  },
  family: {
    bg: "from-emerald-50 to-teal-50", bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="54" cy="54" r="42" fill="#D1FAE5" opacity="0.7"/><circle cx="35" cy="20" r="7" fill="#34D399"/><circle cx="54" cy="18" r="8" fill="#10B981"/><circle cx="73" cy="20" r="7" fill="#34D399"/><rect x="6" y="36" width="98" height="22" rx="7" fill="#6EE7B7"/><rect x="6" y="54" width="98" height="26" rx="5" fill="#ECFDF5"/><rect x="10" y="58" width="22" height="14" rx="4" fill="white" opacity="0.9"/><rect x="44" y="58" width="22" height="14" rx="4" fill="white" opacity="0.9"/><rect x="78" y="58" width="22" height="14" rx="4" fill="white" opacity="0.9"/></svg>),
  },
  female_dorm: {
    bg: "from-pink-50 to-rose-50", bar: "bg-pink-500", badge: "bg-pink-100 text-pink-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="50" cy="52" r="44" fill="#FCE7F3" opacity="0.7"/><rect x="18" y="15" width="6" height="72" rx="3" fill="#EC4899"/><rect x="66" y="15" width="6" height="72" rx="3" fill="#EC4899"/><rect x="16" y="14" width="58" height="7" rx="3.5" fill="#F472B6"/><rect x="16" y="46" width="58" height="6" rx="3" fill="#F472B6"/><rect x="16" y="80" width="58" height="6" rx="3" fill="#F472B6"/><rect x="22" y="22" width="46" height="22" rx="4" fill="#FDF2F8"/><rect x="24" y="24" width="42" height="18" rx="3" fill="#FBCFE8"/><rect x="22" y="54" width="46" height="22" rx="4" fill="#FDF2F8"/><rect x="24" y="56" width="42" height="18" rx="3" fill="#FBCFE8"/><path d="M88 20 L90 26 L96 26 L91 30 L93 36 L88 32 L83 36 L85 30 L80 26 L86 26 Z" fill="#F472B6"/></svg>),
  },
  male_dorm: {
    bg: "from-sky-50 to-cyan-50", bar: "bg-sky-500", badge: "bg-sky-100 text-sky-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="50" cy="52" r="44" fill="#E0F2FE" opacity="0.7"/><rect x="18" y="15" width="6" height="72" rx="3" fill="#0EA5E9"/><rect x="66" y="15" width="6" height="72" rx="3" fill="#0EA5E9"/><rect x="16" y="14" width="58" height="7" rx="3.5" fill="#38BDF8"/><rect x="16" y="46" width="58" height="6" rx="3" fill="#38BDF8"/><rect x="16" y="80" width="58" height="6" rx="3" fill="#38BDF8"/><rect x="22" y="22" width="46" height="22" rx="4" fill="#F0F9FF"/><rect x="24" y="24" width="42" height="18" rx="3" fill="#BAE6FD"/><rect x="22" y="54" width="46" height="22" rx="4" fill="#F0F9FF"/><rect x="24" y="56" width="42" height="18" rx="3" fill="#BAE6FD"/></svg>),
  },
  ac_room: {
    bg: "from-cyan-50 to-teal-50", bar: "bg-cyan-500", badge: "bg-cyan-100 text-cyan-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="52" cy="54" r="42" fill="#CFFAFE" opacity="0.7"/><rect x="12" y="28" width="76" height="30" rx="8" fill="#A5F3FC"/><rect x="16" y="32" width="68" height="22" rx="6" fill="#CFFAFE"/><circle cx="30" cy="43" r="5" fill="#06B6D4"/><circle cx="50" cy="43" r="5" fill="#06B6D4"/><circle cx="70" cy="43" r="5" fill="#06B6D4"/><rect x="8" y="54" width="84" height="30" rx="6" fill="#CFFAFE"/><rect x="16" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/><rect x="60" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/><rect x="82" y="8" width="20" height="10" rx="3" fill="#06B6D4"/></svg>),
  },
  non_ac_room: {
    bg: "from-orange-50 to-amber-50", bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700",
    illustration: (<svg width="90" height="80" viewBox="0 0 110 100" fill="none"><circle cx="52" cy="54" r="42" fill="#FEF3C7" opacity="0.7"/><rect x="12" y="28" width="76" height="30" rx="8" fill="#FDE68A"/><rect x="16" y="32" width="68" height="22" rx="6" fill="#FEF3C7"/><circle cx="30" cy="43" r="5" fill="#F59E0B"/><circle cx="50" cy="43" r="5" fill="#F59E0B"/><circle cx="70" cy="43" r="5" fill="#F59E0B"/><rect x="8" y="54" width="84" height="30" rx="6" fill="#FEF3C7"/><rect x="16" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/><rect x="60" y="54" width="24" height="14" rx="5" fill="white" opacity="0.95"/></svg>),
  },
};

const ITEMS_PER_PAGE = 8;

export default function RoomsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [showBedsModal, setShowBedsModal] = useState(false);
  const [bedsTargetRoom, setBedsTargetRoom] = useState<Room | null>(null);
  const [bedsCount, setBedsCount] = useState("1");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const menuRef = useRef<HTMLDivElement>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const [roomForm, setRoomForm] = useState({
    propertyId: "",
    name: "",
    type: "dorm" as RoomType,
    capacity: "1",
    pricePerNight: "",
    status: "available" as "available" | "maintenance" | "inactive",
    numberOfRooms: "1",
    startingRoomNumber: "101",
  });

  function getRemainingRoomSlots(propId: string, excludeRoomId?: number): number {
    if (!propId) return 999;
    const prop = properties.find(p => p.id === Number(propId));
    if (!prop) return 999;
    const maxRooms = Number(prop.total_beds || 0);
    const usedRooms = rooms.filter(
      r => Number(r.property_id) === Number(propId) && r.id !== excludeRoomId
    ).length;
    return Math.max(maxRooms - usedRooms, 0);
  }

  async function fetchData() {
    try {
      const [propsRes, roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/rooms"),
        fetch("/api/bookings"),
      ]);
      if (propsRes.ok) {
        const d = await propsRes.json();
        setProperties(d.properties ?? []);
        if (d.properties?.length > 0 && !selectedProperty) setSelectedProperty(d.properties[0].id);
      }
      if (roomsRes.ok) { const d = await roomsRes.json(); setRooms(d.rooms ?? []); }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings ?? []); }
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  function getOccupiedForRoom(roomId: number) {
    return bookings.filter(b => Number(b.room_id) === Number(roomId) && ["confirmed", "checked_in"].includes(b.status)).length;
  }

  const scopedRooms = selectedProperty
    ? rooms.filter(r => Number(r.property_id) === Number(selectedProperty))
    : rooms;

  const totalRoomCount = scopedRooms.length;
  const totalBedCount = scopedRooms.reduce((s, r) => s + Number(r.number_of_beds || 0), 0);
  const totalOccupied = scopedRooms.reduce((s, r) => s + getOccupiedForRoom(r.id), 0);
  const totalAvailable = Math.max(totalBedCount - totalOccupied, 0);
  const occupancyPct = totalBedCount > 0 ? Math.round((totalOccupied / totalBedCount) * 100) : 0;

  const filteredRooms = scopedRooms.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function openAddRoom() {
    setEditingRoom(null);
    setRoomForm({
      propertyId: selectedProperty ? String(selectedProperty) : "",
      name: "", type: "dorm", capacity: "1", pricePerNight: "",
      status: "available", numberOfRooms: "1", startingRoomNumber: "101",
    });
    setError(""); setShowRoomModal(true);
  }

  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomForm({
      propertyId: String(room.property_id),
      name: room.name,
      type: room.type,
      capacity: String(room.number_of_beds),
      pricePerNight: String(room.price_per_night),
      status: room.status,
      numberOfRooms: "1",
      startingRoomNumber: "101",
    });
    setError(""); setShowRoomModal(true); setOpenMenuId(null);
  }

  function openSetBeds(room: Room) {
    setBedsTargetRoom(room);
    setBedsCount(String(room.number_of_beds || 1));
    setError(""); setShowBedsModal(true); setOpenMenuId(null);
  }

  function handleDeleteRoom(id: number) {
    setConfirmTitle("Delete Room");
    setConfirmMessage("Are you sure you want to delete this room?");
    setConfirmAction(() => async () => {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      setConfirmOpen(false);
      if (res.ok) { setSuccess("Room deleted!"); await fetchData(); } else setError("Failed to delete room");
      setOpenMenuId(null);
    });
    setConfirmOpen(true);
  }

  async function handleRoomSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";
      const payload = editingRoom
        ? roomForm
        : { ...roomForm, numberOfRooms: roomForm.numberOfRooms, startingRoomNumber: roomForm.startingRoomNumber };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save room"); return; }
      const created = parseInt(roomForm.numberOfRooms, 10) || 1;
      setSuccess(editingRoom ? "Room updated!" : created > 1 ? `${created} rooms created successfully!` : "Room created!");
      setShowRoomModal(false);
      await fetchData();
    } catch { setError("Network error."); } finally { setSubmitting(false); }
  }

  async function handleBedsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bedsTargetRoom) return;
    const count = parseInt(bedsCount, 10);
    if (isNaN(count) || count < 1) { setError("Enter a valid number (minimum 1)"); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${bedsTargetRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: String(bedsTargetRoom.property_id),
          name: bedsTargetRoom.name,
          type: bedsTargetRoom.type,
          capacity: String(count),
          pricePerNight: String(bedsTargetRoom.price_per_night),
          status: bedsTargetRoom.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update beds"); return; }
      setSuccess(`Beds updated to ${count} for ${bedsTargetRoom.name}!`);
      setShowBedsModal(false);
      await fetchData();
    } catch { setError("Network error."); } finally { setSubmitting(false); }
  }

  const remainingRoomSlots = getRemainingRoomSlots(roomForm.propertyId, editingRoom?.id);
  const bulkCount = parseInt(roomForm.numberOfRooms, 10) || 1;
  const isBulk = !editingRoom && bulkCount > 1;
  const bulkExceedsSlots = !editingRoom && !!roomForm.propertyId && bulkCount > remainingRoomSlots;

  // Preview names for bulk
  const bulkPreviewNames = isBulk
    ? Array.from({ length: Math.min(bulkCount, 3) }, (_, i) => `${roomForm.name || "Room"} ${(parseInt(roomForm.startingRoomNumber, 10) || 101) + i}`)
    : [];

  return (
    <div className="space-y-6 pb-8">
      <ConfirmModal
        isOpen={confirmOpen} title={confirmTitle} message={confirmMessage}
        confirmLabel="Delete" onConfirm={confirmAction} onCancel={() => setConfirmOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms & Beds</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage rooms and bed inventory across your properties</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Building2 size={15} className="text-slate-400 flex-shrink-0" />
            <select
              value={selectedProperty || ""}
              onChange={e => { setSelectedProperty(e.target.value ? Number(e.target.value) : null); setCurrentPage(1); }}
              className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer pr-1"
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={13} className="text-slate-400" />
          </div>
          <button onClick={openAddRoom} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Rooms", value: totalRoomCount, sub: `${properties.length} propert${properties.length === 1 ? "y" : "ies"}`, iconBg: "bg-slate-100", iconColor: "text-slate-600", Icon: Building2 },
          { label: "Total Beds", value: totalBedCount, sub: "Sum of all room beds", iconBg: "bg-violet-100", iconColor: "text-violet-600", Icon: BedIcon },
          { label: "Occupied", value: totalOccupied, sub: `${occupancyPct}% occupied`, iconBg: "bg-orange-100", iconColor: "text-orange-600", Icon: TrendingUp },
          { label: "Available", value: totalAvailable, sub: `${100 - occupancyPct}% free`, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", Icon: CheckCircle },
        ].map(({ label, value, sub, iconBg, iconColor, Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search rooms..." value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="input-field pl-9 text-sm w-full"
          />
        </div>
        {filteredRooms.length > 0 && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="h-8 w-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <BedDouble size={32} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">No rooms yet</p>
          <p className="text-sm text-slate-400 mb-6">{searchQuery ? "No rooms match your search." : "Add your first room to get started."}</p>
          {!searchQuery && <button onClick={openAddRoom} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Add Room</button>}
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedRooms.map(room => {
              const occupied = getOccupiedForRoom(room.id);
              const capacity = Number(room.number_of_beds || 0);
              const available = Math.max(capacity - occupied, 0);
              const pct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
              const c = ROOM_CONFIG[room.type] || ROOM_CONFIG.dorm;
              const typeLabel = ROOM_TYPES.find(t => t.value === room.type)?.label || capitalize(room.type);

              return (
                <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200">
                  <div className={`bg-gradient-to-br ${c.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{c.illustration}</div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">{room.name}</h3>
                            <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>{typeLabel}</span>
                            {room.status !== "available" && (
                              <span className="inline-block ml-1 mt-2 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">{capitalize(room.status)}</span>
                            )}
                          </div>
                          <div className="relative flex-shrink-0" ref={openMenuId === room.id ? menuRef : undefined}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === room.id ? null : room.id)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/70 transition-all"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openMenuId === room.id && (
                              <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1">
                                <button onClick={() => openEditRoom(room)} className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Edit size={13} className="text-slate-400" /> Edit Room
                                </button>
                                <button onClick={() => openSetBeds(room)} className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <BedIcon size={13} className="text-slate-400" /> Set Total Beds
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button onClick={() => handleDeleteRoom(room.id)} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 size={13} /> Delete Room
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 flex-1">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-800">{capacity}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Total Beds</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-red-500">{occupied}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Occupied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-emerald-500">{available}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Available</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Occupancy</span>
                      <span className={`text-[11px] font-bold ${pct >= 80 ? "text-red-500" : pct >= 50 ? "text-orange-500" : "text-emerald-500"}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                    <button onClick={() => openSetBeds(room)} className="text-xs font-semibold text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                      <BedIcon size={11} /> Beds ({capacity})
                    </button>
                    <button onClick={() => openEditRoom(room)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                      <Edit size={11} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={openAddRoom}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all flex flex-col items-center justify-center gap-3 p-8 min-h-[280px] group"
            >
              <div className="h-16 w-16 rounded-2xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-all">
                <Plus size={32} className="text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Add New Room</p>
                <p className="text-xs text-slate-400 mt-0.5">Create a new room in this property</p>
              </div>
            </button>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${currentPage === page ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Room", "Type", "Total Beds", "Occupied", "Available", "Occupancy", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedRooms.map(room => {
                const occupied = getOccupiedForRoom(room.id);
                const capacity = Number(room.number_of_beds || 0);
                const available = Math.max(capacity - occupied, 0);
                const pct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
                const c = ROOM_CONFIG[room.type] || ROOM_CONFIG.dorm;
                return (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center flex-shrink-0`}>
                          <BedDouble size={16} className="text-slate-500" />
                        </div>
                        <p className="font-semibold text-slate-900">{room.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                        {ROOM_TYPES.find(t => t.value === room.type)?.label || capitalize(room.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{capacity}</td>
                    <td className="px-4 py-3 font-semibold text-red-500">{occupied}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-500">{available}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${room.status === "available" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {room.status === "available" ? "Active" : capitalize(room.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditRoom(room)} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all" title="Edit Room"><Edit size={12} /></button>
                        <button onClick={() => openSetBeds(room)} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 transition-all" title="Set Beds"><BedIcon size={12} /></button>
                        <button onClick={() => handleDeleteRoom(room.id)} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" title="Delete Room"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Room Modal ── */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRoomModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingRoom ? "Edit Room" : "Add New Room"}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editingRoom ? "Update room details" : "Create a new room"}</p>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"><X size={16} /></button>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">

              {/* Property */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property *</label>
                <select required value={roomForm.propertyId} onChange={e => setRoomForm({ ...roomForm, propertyId: e.target.value })} className="input-field w-full text-sm">
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {roomForm.propertyId && !editingRoom && (
                  <p className="text-[11px] mt-1 text-slate-400">
                    {remainingRoomSlots > 0
                      ? <span>{remainingRoomSlots} room slot{remainingRoomSlots !== 1 ? "s" : ""} remaining</span>
                      : <span className="text-red-500">Room limit reached — increase limit in Property settings</span>
                    }
                  </p>
                )}
              </div>

              {/* Room Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isBulk ? "Room Name Prefix *" : "Room Name *"}
                </label>
                <input
                  type="text" required
                  placeholder={isBulk ? "e.g. Room, Dorm A" : "e.g. Dorm A, Room 101"}
                  value={roomForm.name}
                  onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="input-field w-full text-sm"
                />
                {isBulk && roomForm.name && (
                  <p className="text-[11px] mt-1 text-slate-400">
                    Will create: <span className="font-semibold text-slate-600">
                      {bulkPreviewNames.join(", ")}{bulkCount > 3 ? ` ... +${bulkCount - 3} more` : ""}
                    </span>
                  </p>
                )}
              </div>

              {/* Type + Beds in this Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type *</label>
                  <select value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value as RoomType })} className="input-field w-full text-sm">
                    {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beds in this Room *</label>
                  <input type="number" required min={1}
                    placeholder="e.g. 8" value={roomForm.capacity}
                    onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="input-field w-full text-sm" />
                  <p className="text-[11px] text-slate-400 mt-1">No limit — enter any number</p>
                </div>
              </div>

              {/* Number of Rooms — only for Add mode */}
              {!editingRoom && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Hash size={11} /> Number of Rooms
                    </label>
                    <input
                      type="number" min={1} max={remainingRoomSlots || 999}
                      value={roomForm.numberOfRooms}
                      onChange={e => setRoomForm({ ...roomForm, numberOfRooms: e.target.value })}
                      className="input-field w-full text-sm font-semibold"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {bulkCount > 1 ? <span className="text-orange-500 font-semibold">{bulkCount} rooms will be created</span> : "Default: 1"}
                    </p>
                  </div>
                  {isBulk && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Starting Number</label>
                      <input
                        type="number" min={1}
                        value={roomForm.startingRoomNumber}
                        onChange={e => setRoomForm({ ...roomForm, startingRoomNumber: e.target.value })}
                        className="input-field w-full text-sm"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">e.g. 101 → Room 101, 102...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Price + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price/Night (₹) *</label>
                  <input type="number" required min={0} placeholder="500" value={roomForm.pricePerNight} onChange={e => setRoomForm({ ...roomForm, pricePerNight: e.target.value })} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value as any })} className="input-field w-full text-sm">
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Bulk exceeded warning */}
              {bulkExceedsSlots && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-red-600 font-semibold">
                    Only {remainingRoomSlots} slot{remainingRoomSlots !== 1 ? "s" : ""} remaining — reduce the number of rooms.
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || bulkExceedsSlots || (!editingRoom && remainingRoomSlots === 0 && !!roomForm.propertyId)}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingRoom
                      ? "Update Room"
                      : isBulk
                        ? `Create ${bulkCount} Rooms`
                        : "Add Room"
                  }
                </button>
                <button type="button" onClick={() => setShowRoomModal(false)} className="btn-secondary px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Set Total Beds Modal ── */}
      {showBedsModal && bedsTargetRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBedsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Set Total Beds</h2>
                <p className="text-xs text-slate-400 mt-0.5">for <span className="font-semibold text-slate-600">{bedsTargetRoom.name}</span></p>
              </div>
              <button onClick={() => setShowBedsModal(false)} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBedsSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Beds *</label>
                <input
                  type="number" required min={1}
                  value={bedsCount}
                  onChange={e => setBedsCount(e.target.value)}
                  className="input-field w-full text-lg font-bold text-center"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  Currently <span className="font-semibold text-slate-600">{bedsTargetRoom.number_of_beds}</span> beds · Enter any number
                </p>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? "Saving..." : "Update Beds"}
                </button>
                <button type="button" onClick={() => setShowBedsModal(false)} className="btn-secondary px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
