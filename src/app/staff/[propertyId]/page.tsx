'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  BedDouble, Calendar, LogIn, LogOut, Clock,
  Users, XCircle, Search, Plus, X, Check,
  IndianRupee, AlertCircle, CheckCircle
} from 'lucide-react'

export default function StaffPortal() {
  const params = useParams()
  const searchParams = useSearchParams()
  const propertyId = params?.propertyId as string
  const token = searchParams.get('token') || ''

  const [property, setProperty] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    guestName: '', guestPhone: '', checkIn: '', checkOut: '',
    numberOfGuests: '1', amount: '', roomId: '',
    paymentStatus: 'pending', paymentMethod: 'cash', notes: ''
  })

  const todayStr = new Date().toLocaleDateString('en-CA')
  const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString('en-CA')

  async function fetchData() {
    try {
      const res = await fetch(`/api/staff/${propertyId}?token=${token}`)
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setProperty(data.property)
      setBookings(data.bookings)
      setRooms(data.rooms || [])
    } catch { setError('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!propertyId || !token) { setError('Invalid access link'); setLoading(false); return }
    fetchData()
  }, [propertyId, token])

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 3000); return () => clearTimeout(t) }
  }, [successMsg])

  const getDateStr = (d: any): string => {
    if (!d) return ''
    const s = String(d)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    if (s.includes('T')) return s.split('T')[0]
    try { return new Date(s).toLocaleDateString('en-CA') } catch { return '' }
  }

  const fmtDate = (d: any) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return '—' }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700' }
      case 'checked_in': return { label: 'Checked In', cls: 'bg-emerald-100 text-emerald-700' }
      case 'checked_out': return { label: 'Checked Out', cls: 'bg-slate-100 text-slate-600' }
      case 'cancelled': return { label: 'Cancelled', cls: 'bg-red-100 text-red-600' }
      default: return { label: 'Pending', cls: 'bg-amber-100 text-amber-700' }
    }
  }

  // Stats
  const todayArrivals = bookings.filter(b => getDateStr(b.check_in) === todayStr && b.status !== 'cancelled').length
  const todayDepartures = bookings.filter(b => getDateStr(b.check_out) === todayStr && b.status !== 'cancelled').length
  const currentGuests = bookings.filter(b => b.status === 'checked_in').length
  const totalBeds = Number(property?.total_beds || 0)
  const occupiedBeds = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length
  const availableBeds = Math.max(0, totalBeds - occupiedBeds)
  const pendingPayments = bookings.filter(b => b.payment_status === 'pending' && b.status !== 'cancelled').length
  const totalRevenue10Days = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s: number, b: any) => s + Number(b.final_amount || 0), 0)

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone?.includes(search) ||
      b.booking_code?.toLowerCase().includes(search.toLowerCase())
    const d = getDateStr(b.check_in)
    const matchFilter =
      filter === 'all' ? true :
      filter === 'today' ? d === todayStr :
      filter === 'upcoming' ? d >= tomorrowStr :
      filter === 'checked_in' ? b.status === 'checked_in' :
      filter === 'pending_pay' ? b.payment_status === 'pending' : true
    return matchSearch && matchFilter && b.status !== 'cancelled'
  })

  async function handleAddBooking(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/staff/${propertyId}?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSuccessMsg(`Booking created! Code: ${data.booking?.booking_code}`)
      setShowAddModal(false)
      setForm({ guestName: '', guestPhone: '', checkIn: '', checkOut: '', numberOfGuests: '1', amount: '', roomId: '', paymentStatus: 'pending', paymentMethod: 'cash', notes: '' })
      fetchData()
    } catch (err: any) {
      setSuccessMsg('Error: ' + err.message)
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-10 w-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading staff portal...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-lg border border-red-100">
        <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle size={24} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-400 mt-3">Contact your property owner for a valid access link.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Toast */}
      {successMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold ${successMsg.startsWith('Error') ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          <Check size={15} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">{property?.name?.[0] || 'H'}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{property?.name}</p>
              <p className="text-xs text-slate-400">Staff Portal · {property?.city}, {property?.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">● Staff Access</span>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
              <Plus size={13} /> Add Booking
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-orange-500" />
          <span className="text-sm text-slate-600 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="ml-auto text-xs text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-full">Last 10 days data</span>
        </div>

        {/* 6 Stat Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'Arrivals', value: todayArrivals, icon: <LogIn size={14} className="text-emerald-600" />, bg: 'bg-emerald-50', click: () => setFilter('today') },
            { label: 'Departures', value: todayDepartures, icon: <LogOut size={14} className="text-blue-600" />, bg: 'bg-blue-50', click: () => setFilter('today') },
            { label: 'Checked In', value: currentGuests, icon: <Users size={14} className="text-violet-600" />, bg: 'bg-violet-50', click: () => setFilter('checked_in') },
            { label: 'Avail. Beds', value: availableBeds, icon: <BedDouble size={14} className="text-orange-600" />, bg: 'bg-orange-50', click: () => {} },
            { label: 'Pending Pay', value: pendingPayments, icon: <AlertCircle size={14} className="text-red-500" />, bg: 'bg-red-50', click: () => setFilter('pending_pay') },
            { label: '10d Revenue', value: `₹${(totalRevenue10Days/1000).toFixed(1)}k`, icon: <IndianRupee size={14} className="text-slate-600" />, bg: 'bg-slate-100', click: () => {} },
          ].map(s => (
            <button key={s.label} onClick={s.click}
              className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-left hover:shadow-md transition-all">
              <div className={`w-6 h-6 ${s.bg} rounded-lg flex items-center justify-center mb-1.5`}>{s.icon}</div>
              <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Property Info */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Type: <strong className="text-slate-800 capitalize">{property?.type}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Beds: <strong className="text-slate-800">{totalBeds}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Check-in: <strong className="text-slate-800">{property?.check_in_time || '14:00'}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Check-out: <strong className="text-slate-800">{property?.check_out_time || '11:00'}</strong></span>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">Bookings <span className="text-xs font-normal text-slate-400 ml-1">(last 10 days)</span></h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search guest..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'today', label: 'Today' },
                  { key: 'checked_in', label: 'In-House' },
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'pending_pay', label: '💰 Pending Pay' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${filter === f.key ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(b => {
                const sc = getStatusConfig(b.status)
                const initials = b.guest_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const isToday = getDateStr(b.check_in) === todayStr
                const isCheckoutToday = getDateStr(b.check_out) === todayStr
                const isPendingPay = b.payment_status === 'pending'
                return (
                  <div key={b.id}
                    className={`px-4 py-4 hover:bg-slate-50 transition-colors ${isToday ? 'border-l-[3px] border-orange-400' : isPendingPay ? 'border-l-[3px] border-amber-400' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-orange-600">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{b.guest_name}</p>
                            {b.guest_phone && <p className="text-xs text-slate-400">📱 {b.guest_phone}</p>}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
                        </div>

                        {/* Booking code */}
                        {b.booking_code && (
                          <p className="text-[10px] text-slate-400 mb-1.5 font-mono">#{b.booking_code}</p>
                        )}

                        {/* Dates */}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                          <span className={isToday ? 'text-orange-600 font-semibold' : ''}>
                            → Check-in: {fmtDate(b.check_in)}{isToday && ' (Today!)'}
                          </span>
                          <span className={isCheckoutToday ? 'text-blue-600 font-semibold' : ''}>
                            ← Check-out: {fmtDate(b.check_out)}{isCheckoutToday && ' (Today!)'}
                          </span>
                          {b.number_of_guests && <span>👥 {b.number_of_guests} guest{b.number_of_guests > 1 ? 's' : ''}</span>}
                          {b.room_name && <span>🏠 {b.room_name}</span>}
                          {b.booking_source && <span className="capitalize">📌 {b.booking_source?.replace('_', ' ')}</span>}
                        </div>

                        {/* Amount + Payment row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Amount */}
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                            <IndianRupee size={11} className="text-slate-600" />
                            <span className="text-sm font-bold text-slate-900">{Number(b.final_amount || 0).toLocaleString('en-IN')}</span>
                          </div>

                          {/* Payment status */}
                          <button
                            onClick={() => setShowPayModal(b)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${isPendingPay ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' : 'bg-green-100 text-green-700 border border-green-200'}`}
                          >
                            {isPendingPay ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
                            {isPendingPay ? 'Payment Pending — Verify' : 'Paid'}
                          </button>
                        </div>

                        {/* UTR info if available */}
                        {b.utr_number && (
                          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-xs text-blue-700">
                            UTR: <strong className="font-mono">{b.utr_number}</strong>
                            {b.payment_sender_name && <> · Sender: <strong>{b.payment_sender_name}</strong></>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-center py-2">
          <p className="text-xs text-slate-300">HostOps Staff Portal · {property?.name} · Limited Access</p>
        </div>
      </div>

      {/* ── Payment Detail Modal ── */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Payment Details</h2>
              <button onClick={() => setShowPayModal(null)} className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <X size={14} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-semibold">{showPayModal.guest_name}</p>
            <p className="text-xs text-slate-400 mb-4 font-mono">#{showPayModal.booking_code}</p>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Amount to Collect</span>
                <span className="font-bold text-slate-900 text-base">₹{Number(showPayModal.final_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-bold ${showPayModal.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  {showPayModal.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-700 capitalize">{showPayModal.payment_method || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">UTR Number</span>
                <span className={`font-mono text-xs font-bold ${showPayModal.utr_number ? (!/^\d{12}$/.test(showPayModal.utr_number) ? 'text-red-500' : 'text-slate-800') : 'text-slate-400'}`}>
                  {showPayModal.utr_number || 'Not provided'}
                  {showPayModal.utr_number && !/^\d{12}$/.test(showPayModal.utr_number) && <span className="ml-1 text-[10px] text-red-400">⚠ Verify</span>}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Sender Name</span>
                <span className="font-medium text-slate-700">{showPayModal.payment_sender_name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Payment Date</span>
                <span className="font-medium text-slate-700">
                  {showPayModal.payment_date ? new Date(showPayModal.payment_date).toLocaleDateString('en-IN') : 'Not provided'}
                </span>
              </div>
            </div>

            {showPayModal.payment_status === 'pending' && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-800 mb-1">📋 Staff Note</p>
                <p className="text-xs text-amber-700">Cross-check UTR with owner's bank account before confirming payment. Only the owner can mark this as paid.</p>
              </div>
            )}

            <button onClick={() => setShowPayModal(null)}
              className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Add Booking Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl mb-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Add Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <X size={14} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Name *</label>
                  <input required value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                    placeholder="Guest full name"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                    placeholder="10-digit phone"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Check-in *</label>
                  <input required type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Check-out *</label>
                  <input required type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. of Guests</label>
                  <input type="number" min="1" value={form.numberOfGuests} onChange={e => setForm(f => ({ ...f, numberOfGuests: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) *</label>
                  <input required type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="2000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                {rooms.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Room</label>
                    <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300">
                      <option value="">Select Room (optional)</option>
                      {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Status</label>
                  <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special requests..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">ℹ️ This booking will be added to the owner's system immediately as a walk-in booking.</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors">
                  {submitting ? 'Adding...' : 'Add Booking'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
