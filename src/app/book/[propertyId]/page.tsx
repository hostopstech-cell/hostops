"use client";
import { useState, useEffect } from "react";

interface Guest { name: string; phone: string; idtype: string; idnumber: string; }
interface RoomGroup {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  number_of_beds: number;
  available_beds: number;
  available_count: number;
  total_rooms: number;
  is_available: boolean;
  available_room_ids: { id: string; available_beds?: number }[];
}

export default function BookPage({ params }: { params: { propertyId: string } }) {
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomGroup | null>(null);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guests, setGuests] = useState<Guest[]>([{ name: "", phone: "", idtype: "aadhaar", idnumber: "" }]);
  const [utr, setUtr] = useState("");
  const [senderName, setSenderName] = useState("");
  const [payDate, setPayDate] = useState("");
  const [stepError, setStepError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/chat/${params.propertyId}?checkin=${today}&checkout=${tomorrow}`);
        const data = await res.json();
        if (data.error) { setError("Property not found or booking not available."); setLoading(false); return; }
        if (data.property) setProperty(data.property);
        if (data.rooms) setRooms(data.rooms);
        setLoading(false);
      } catch { setError("Could not load property."); setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!checkin || !checkout || checkin >= checkout) return;
    async function refetch() {
      try {
        const res = await fetch(`/api/chat/${params.propertyId}?checkin=${checkin}&checkout=${checkout}`);
        const data = await res.json();
        if (data.rooms) {
          setRooms(data.rooms);
          if (selectedRoom) {
            const updated = data.rooms.find((r: RoomGroup) => r.id === selectedRoom.id);
            if (!updated?.is_available) setSelectedRoom(null);
          }
        }
      } catch {}
    }
    refetch();
  }, [checkin, checkout]);

  useEffect(() => {
    setGuests(prev => {
      const arr = [...prev];
      while (arr.length < guestCount) arr.push({ name: "", phone: "", idtype: "aadhaar", idnumber: "" });
      return arr.slice(0, guestCount);
    });
  }, [guestCount]);

  const isDorm = (type: string) => type === "dorm" || type === "mixed_dorm";
  const nights = checkin && checkout ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000)) : 0;
  const totalAmount = selectedRoom && nights > 0
    ? isDorm(selectedRoom.type)
      ? selectedRoom.price_per_night * guestCount * nights
      : selectedRoom.price_per_night * nights
    : 0;

  function validateId(type: string, num: string) {
    const n = num.trim().toUpperCase();
    switch (type) {
      case "aadhaar": return /^\d{12}$/.test(n);
      case "pan": return /^[A-Z]{5}\d{4}[A-Z]$/.test(n);
      case "passport": return /^[A-Z]\d{7}$/.test(n);
      case "voter": return /^[A-Z]{3}\d{7}$/.test(n);
      case "driving": return /^[A-Z0-9]{10,16}$/.test(n);
      default: return true;
    }
  }

  function idPlaceholder(type: string) {
    switch (type) {
      case "aadhaar": return "123456789012 (12 digits)";
      case "pan": return "ABCDE1234F";
      case "passport": return "A1234567";
      case "voter": return "ABC1234567";
      case "driving": return "MH0120210012345";
      default: return "Enter ID number";
    }
  }

  function validateStep() {
    if (step === 1) {
      if (!selectedRoom) return "Please select a room type.";
      if (!selectedRoom.is_available) return "This room type is not available for the selected dates.";
      if (!checkin) return "Please select check-in date.";
      if (!checkout) return "Please select check-out date.";
      if (checkin >= checkout) return "Check-out must be after check-in.";
      if (isDorm(selectedRoom.type) && guestCount > selectedRoom.available_beds) return `Only ${selectedRoom.available_beds} bed(s) available.`;
      if (!isDorm(selectedRoom.type) && selectedRoom.available_count < 1) return "No rooms available for these dates.";
    }
    if (step === 2) {
      for (let i = 0; i < guestCount; i++) {
        const g = guests[i];
        if (!g.name.trim()) return `Guest ${i + 1}: name is required.`;
        if (!/^\d{7,12}$/.test(g.phone)) return `Guest ${i + 1}: enter valid phone number.`;
        if (!g.idnumber.trim()) return `Guest ${i + 1}: ID number is required.`;
        if (!validateId(g.idtype, g.idnumber)) return `Guest ${i + 1}: ${g.idtype} number is invalid.`;
      }
    }
    if (step === 4) {
      if (!/^\d{12}$/.test(utr)) return "UTR must be exactly 12 digits.";
      if (!senderName.trim()) return "Sender name is required.";
      if (!payDate) return "Payment date is required.";
    }
    return "";
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError("");
    setStep(s => s + 1);
  }

  async function submitBooking() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/chat/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: params.propertyId,
          name: guests[0].name,
          phone: guests[0].phone,
          checkin, checkout,
          guests: guestCount,
          room: selectedRoom?.name,
          amount: totalAmount,
          idtype: guests[0].idtype,
          idnumber: guests[0].idnumber,
          utr, sender: senderName, paydate: payDate,
          guestsData: { guests },
          available_room_ids: selectedRoom?.available_room_ids || [],
        }),
      });
      const data = await res.json();
      if (!data.success) { setStepError(data.error || "Booking failed. Please try again."); setSubmitting(false); return; }
      setBookingCode(data.booking_code || "");
      setBookingDone(true);
    } catch { setStepError("Something went wrong. Please try again."); }
    setSubmitting(false);
  }

  const dormRooms = rooms.filter(r => isDorm(r.type));
  const privateRooms = rooms.filter(r => !isDorm(r.type));

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading property...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm w-full">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-slate-700">{error}</p>
      </div>
    </div>
  );

  if (bookingDone) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Booking Confirmed!</h2>
        <p className="text-slate-500 text-sm mb-4">Your stay at {property?.name} is confirmed.</p>
        {bookingCode && <p className="text-xs text-indigo-500 font-mono bg-indigo-50 rounded-lg px-3 py-1 mb-4">Booking ID: {bookingCode}</p>}
        <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-1.5 mb-4">
          <div className="flex justify-between"><span className="text-slate-400">Room Type</span><span className="font-medium text-slate-800">{selectedRoom?.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-in</span><span className="font-medium text-slate-800">{checkin}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-out</span><span className="font-medium text-slate-800">{checkout}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-medium text-slate-800">{guestCount}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5"><span className="font-bold text-slate-700">Total Paid</span><span className="font-bold text-green-600">₹{totalAmount}</span></div>
        </div>
        <p className="text-xs text-slate-400">📞 {property?.contact}</p>
        <p className="text-xs text-green-600 mt-2 font-medium">See you soon! 🙏</p>
      </div>
    </div>
  );

  function RoomCard({ r }: { r: RoomGroup }) {
    const dorm = isDorm(r.type);
    const selected = selectedRoom?.id === r.id;
    const unavailable = !r.is_available;
    const availableLabel = dorm
      ? `${r.available_beds} bed${r.available_beds !== 1 ? "s" : ""} available`
      : `${r.available_count} room${r.available_count !== 1 ? "s" : ""} available`;

    return (
      <button
        onClick={() => !unavailable && setSelectedRoom(r)}
        disabled={unavailable}
        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all relative ${
          unavailable
            ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
            : selected
            ? "border-indigo-500 bg-indigo-50 shadow-sm"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className={`font-semibold text-sm ${unavailable ? "text-slate-400" : "text-slate-800"}`}>{r.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {unavailable ? "Not available for selected dates" : availableLabel}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            {unavailable ? (
              <span className="text-xs font-semibold text-red-400 bg-red-50 px-2 py-1 rounded-lg">Sold Out</span>
            ) : (
              <div>
                <p className="font-bold text-indigo-600">₹{r.price_per_night}</p>
                <p className="text-xs text-slate-400">/{dorm ? "bed" : "room"}/night</p>
              </div>
            )}
          </div>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🏨</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{property?.name || "Loading..."}</h1>
              <p className="text-white/70 text-xs">{property?.city} · {property?.type}</p>
            </div>
          </div>
          {step > 0 && (
            <div className="flex gap-1.5 mt-4">
              {["Room", "Guests", "Summary", "Payment"].map((label, i) => (
                <div key={i} className="flex-1">
                  <div className={`h-1 rounded-full transition-all ${step > i + 1 ? "bg-white" : step === i + 1 ? "bg-white" : "bg-white/25"}`} />
                  <p className={`text-[9px] mt-1 text-center ${step >= i + 1 ? "text-white" : "text-white/40"}`}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to {property?.name}!</h2>
              <p className="text-slate-500 text-sm mb-2">{property?.city} · {property?.type}</p>
              <p className="text-slate-400 text-xs mb-6">Check-in: {property?.check_in_time} · Check-out: {property?.check_out_time}</p>
              {rooms.length === 0 ? (
                <div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">No rooms available right now. Contact: {property?.contact}</div>
              ) : (
                <button onClick={() => setStep(1)} className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition">
                  Book a Room →
                </button>
              )}
            </div>
          )}

          {/* Step 1: Room & Dates */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 text-lg">Choose Room & Dates</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Check-in</label>
                  <input type="date" value={checkin} min={today}
                    onChange={e => { setCheckin(e.target.value); setSelectedRoom(null); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Check-out</label>
                  <input type="date" value={checkout} min={checkin || today}
                    onChange={e => { setCheckout(e.target.value); setSelectedRoom(null); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                </div>
              </div>

              {dormRooms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Dorm Beds</p>
                  <div className="space-y-2">{dormRooms.map(r => <RoomCard key={r.id} r={r} />)}</div>
                </div>
              )}
              {privateRooms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Private Rooms</p>
                  <div className="space-y-2">{privateRooms.map(r => <RoomCard key={r.id} r={r} />)}</div>
                </div>
              )}

              {selectedRoom && isDorm(selectedRoom.type) && (
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Number of Guests</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuestCount(g => Math.max(1, g - 1))} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-200">−</button>
                    <span className="text-lg font-bold text-slate-800 w-8 text-center">{guestCount}</span>
                    <button onClick={() => setGuestCount(g => Math.min(selectedRoom.available_beds, g + 1))} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-200">+</button>
                    <span className="text-xs text-slate-400">guests (max {selectedRoom.available_beds})</span>
                  </div>
                </div>
              )}

              {selectedRoom && nights > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm">
                  <p className="text-indigo-700 font-semibold">{selectedRoom.name} · {nights} night{nights > 1 ? "s" : ""}</p>
                  <p className="text-indigo-500 text-xs mt-0.5">
                    {isDorm(selectedRoom.type)
                      ? `₹${selectedRoom.price_per_night} × ${guestCount} guest${guestCount > 1 ? "s" : ""} × ${nights} night${nights > 1 ? "s" : ""}`
                      : `₹${selectedRoom.price_per_night} × ${nights} night${nights > 1 ? "s" : ""}`}
                    {" = "}<strong className="text-indigo-700">₹{totalAmount}</strong>
                  </p>
                </div>
              )}

              {stepError && <p className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg">{stepError}</p>}
              <button onClick={nextStep} className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 text-lg">Guest Details</h2>
              {!isDorm(selectedRoom?.type || "") && (
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Number of Guests</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuestCount(g => Math.max(1, g - 1))} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-200">−</button>
                    <span className="text-lg font-bold text-slate-800 w-8 text-center">{guestCount}</span>
                    <button onClick={() => setGuestCount(g => Math.min(10, g + 1))} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-200">+</button>
                    <span className="text-xs text-slate-400">guests</span>
                  </div>
                </div>
              )}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {guests.map((g, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-indigo-500 uppercase">Guest {i + 1}</p>
                    <input placeholder="Full Name" value={g.name}
                      onChange={e => { const a = [...guests]; a[i].name = e.target.value; setGuests(a); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                    <input placeholder="Phone Number" value={g.phone} type="tel" maxLength={12}
                      onChange={e => { const a = [...guests]; a[i].phone = e.target.value.replace(/\D/g, ""); setGuests(a); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                    <select value={g.idtype}
                      onChange={e => { const a = [...guests]; a[i].idtype = e.target.value; a[i].idnumber = ""; setGuests(a); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 text-slate-800 bg-white">
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="voter">Voter ID</option>
                      <option value="driving">Driving License</option>
                    </select>
                    <input placeholder={idPlaceholder(g.idtype)} value={g.idnumber}
                      onChange={e => { const a = [...guests]; a[i].idnumber = e.target.value.toUpperCase(); setGuests(a); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 text-slate-800 font-mono" />
                  </div>
                ))}
              </div>
              {stepError && <p className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg">{stepError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50">← Back</button>
                <button onClick={nextStep} className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 text-lg">Booking Summary</h2>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Property</span><span className="font-medium text-slate-800">{property?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Room Type</span><span className="font-medium text-slate-800">{selectedRoom?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Check-in</span><span className="font-medium text-slate-800">{checkin}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Check-out</span><span className="font-medium text-slate-800">{checkout}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Nights</span><span className="font-medium text-slate-800">{nights}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-medium text-slate-800">{guestCount}</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="font-bold text-indigo-600 text-base">₹{totalAmount}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase">Guests</p>
                {guests.map((g, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-700">
                    <strong>{g.name}</strong> · {g.phone} · {g.idtype.toUpperCase()}: {g.idnumber}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50">← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600">Confirm & Pay →</button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 text-lg">Payment</h2>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-400 mb-1">Pay via UPI</p>
                <p className="text-indigo-700 font-bold text-lg">{property?.upi_id || "Contact property"}</p>
                <p className="text-xs text-indigo-400 mt-1">{property?.payment_name || property?.name}</p>
                <div className="mt-3 bg-white rounded-lg px-4 py-2 inline-block">
                  <p className="text-2xl font-black text-indigo-600">₹{totalAmount}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">After paying, enter UTR/transaction details below:</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">UTR Number <span className="text-slate-400">(12 digits)</span></label>
                  <input placeholder="123456789012" value={utr} maxLength={12}
                    onChange={e => setUtr(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 text-slate-800 font-mono tracking-widest" />
                  {utr.length > 0 && utr.length !== 12 && <p className="text-xs text-amber-500 mt-1">{utr.length}/12 digits</p>}
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Sender Name</label>
                  <input placeholder="Name as in bank account" value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Payment Date</label>
                  <input type="date" value={payDate} max={today}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 text-slate-800" />
                </div>
              </div>
              {stepError && <p className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg">{stepError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50">← Back</button>
                <button onClick={submitBooking} disabled={submitting}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50">
                  {submitting ? "Confirming..." : "Confirm Booking ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
