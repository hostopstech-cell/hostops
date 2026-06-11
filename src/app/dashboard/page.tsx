'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Wallet, BedDouble, Building2,
  AlertCircle, LogIn, LogOut, Calendar, ChevronRight,
  Users, ArrowUpRight
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [ownerName, setOwnerName] = useState('Owner')
  const [loading, setLoading] = useState(true)
  const [revenueView, setRevenueView] = useState<'week' | 'month'>('week')

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const todayStr = new Date().toLocaleDateString('en-CA')
  const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString('en-CA')

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
    ]).then(([authData, bookingsData, propsData]) => {
      if (authData?.owner?.name) setOwnerName(authData.owner.name.split(' ')[0])
      if (bookingsData?.bookings) setAllBookings(bookingsData.bookings)
      if (propsData?.properties) setProperties(propsData.properties)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const getDateStr = (d: any): string => {
    if (!d) return ''
    try {
      const s = String(d)
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
      if (s.includes('T')) return s.split('T')[0]
      const parsed = new Date(s)
      if (!isNaN(parsed.getTime())) return parsed.toLocaleDateString('en-CA')
    } catch {}
    return ''
  }

  // PAID ONLY helpers
  const isPaid = (b: any) => b.payment_status === 'paid'
  const isActive = (b: any) => ['confirmed', 'checked_in'].includes(b.status) && !['cancelled'].includes(b.status)

  // Revenue: sirf paid
  const todayRevenue = allBookings
    .filter(b => getDateStr(b.check_in) === todayStr && b.status !== 'cancelled' && isPaid(b))
    .reduce((s, b) => s + Number(b.final_amount || 0), 0)

  const totalBeds = properties.reduce((s, p) => s + Number(p.total_beds || 0), 0)

  // Occupancy: sirf paid + active
  const occupiedBeds = allBookings.filter(b => isActive(b) && isPaid(b)).length
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
  const availableBeds = Math.max(0, totalBeds - occupiedBeds)

  // Pending: payment_status = 'pending' wali bookings
  const pendingPaymentBookings = allBookings.filter(b =>
    b.payment_status === 'pending' && b.status !== 'cancelled'
  )
  const pendingPaymentTotal = pendingPaymentBookings.reduce((s, b) => s + Number(b.final_amount || 0), 0)

  // Arrivals/Departures: sirf paid
  const arrivalsToday = allBookings.filter(b =>
    getDateStr(b.check_in) === todayStr && b.status !== 'cancelled' && isPaid(b)
  ).length
  const departuresToday = allBookings.filter(b =>
    getDateStr(b.check_out) === todayStr && b.status !== 'cancelled' && isPaid(b)
  ).length
  const newBookingRequests = allBookings.filter(b =>
    getDateStr(b.check_in) > todayStr && b.status !== 'cancelled'
  ).length

  // Revenue chart: sirf paid
  const thisMonth = new Date().toISOString().slice(0, 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dStr = d.toLocaleDateString('en-CA')
    const rev = allBookings
      .filter(b => getDateStr(b.check_in) === dStr && b.status !== 'cancelled' && isPaid(b))
      .reduce((s, b) => s + Number(b.final_amount || 0), 0)
    return { label: d.toLocaleDateString('en-IN', { weekday: 'short' }), rev, isToday: dStr === todayStr }
  })
  const weekRevenue = weekDays.reduce((s, d) => s + d.rev, 0)

  const monthRevenue = allBookings
    .filter(b => getDateStr(b.check_in).startsWith(thisMonth) && b.status !== 'cancelled' && isPaid(b))
    .reduce((s, b) => s + Number(b.final_amount || 0), 0)

  const monthWeeks = Array.from({ length: 4 }, (_, w) => {
    const weekNum = 3 - w
    const start = new Date(); start.setDate(start.getDate() - weekNum * 7 - 6); start.setHours(0,0,0,0)
    const end = new Date(); end.setDate(end.getDate() - weekNum * 7); end.setHours(23,59,59,999)
    const rev = allBookings
      .filter(b => {
        if (!b.check_in || b.status === 'cancelled' || !isPaid(b)) return false
        const d = new Date(b.check_in)
        return d >= start && d <= end
      })
      .reduce((s, b) => s + Number(b.final_amount || 0), 0)
    return { label: `Wk ${4 - weekNum}`, rev, isToday: false }
  })

  const chartData = revenueView === 'week' ? weekDays : monthWeeks
  const maxRev = Math.max(...chartData.map(d => d.rev), 1)

  const recentBookings = allBookings
    .filter(b => getDateStr(b.check_in) >= tomorrowStr && b.status !== 'cancelled')
    .slice(0, 5)

  // Property ranking: sirf paid income
  const propRanking = properties.map(p => {
    const propBookings = allBookings.filter(b =>
      String(b.property_id) === String(p.id) &&
      getDateStr(b.check_in).startsWith(thisMonth) &&
      b.status !== 'cancelled' &&
      isPaid(b)
    )
    const income = propBookings.reduce((s, b) => s + Number(b.final_amount || 0), 0)
    const activeBookings = allBookings.filter(b =>
      String(b.property_id) === String(p.id) && isActive(b) && isPaid(b)
    ).length
    const occ = Number(p.total_beds) > 0
      ? Math.round((activeBookings / Number(p.total_beds)) * 100)
      : 0
    return { ...p, income, occ, activeBookings }
  }).sort((a, b) => b.income - a.income)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border border-blue-200' }
      case 'checked_in': return { label: 'Checked In', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
      case 'checked_out': return { label: 'Checked Out', cls: 'bg-slate-100 text-slate-600 border border-slate-200' }
      case 'cancelled': return { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border border-red-200' }
      default: return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' }
    }
  }

  const fmtDate = (d: string) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return '—' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-10 w-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {ownerName}! 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your properties today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-fit shadow-sm">
          <Calendar size={15} className="text-orange-500" />
          <span className="text-sm text-slate-600 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Pending Alert Banner */}
      {pendingPaymentBookings.length > 0 && (
        <div onClick={() => router.push('/dashboard/bookings')}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-100 transition-colors">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingPaymentBookings.length} booking{pendingPaymentBookings.length !== 1 ? 's' : ''} pending verification — ₹{pendingPaymentTotal.toLocaleString('en-IN')} unverified
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Click Check In button after verifying payment to count in revenue & occupancy</p>
          </div>
          <ChevronRight size={14} className="text-amber-400" />
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => router.push('/dashboard/revenue')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wallet size={18} className="text-orange-600" />
            </div>
            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 font-medium mb-1">Today's Revenue</p>
          <p className="text-2xl font-bold text-slate-900">₹{todayRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">verified paid only</p>
        </div>

        <div onClick={() => router.push('/dashboard/properties')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-purple-600" />
            </div>
            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 font-medium mb-1">Occupancy</p>
          <p className="text-2xl font-bold text-slate-900">{occupancyRate}%</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
            </div>
            <p className="text-xs text-slate-400 whitespace-nowrap">{occupiedBeds}/{totalBeds}</p>
          </div>
        </div>

        <div onClick={() => router.push('/dashboard/rooms')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BedDouble size={18} className="text-blue-600" />
            </div>
            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 font-medium mb-1">Available Beds</p>
          <p className="text-2xl font-bold text-slate-900">{availableBeds}</p>
          <p className="text-xs text-slate-400 mt-2">of {totalBeds} total · {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>

        <div onClick={() => router.push('/dashboard/bookings')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-red-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-red-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 font-medium mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-red-500">₹{pendingPaymentTotal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">{pendingPaymentBookings.length} booking{pendingPaymentBookings.length !== 1 ? 's' : ''} unverified</p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* Revenue Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-slate-900">Revenue This {revenueView === 'week' ? 'Week' : 'Month'}</h2>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setRevenueView('week')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${revenueView === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Week
              </button>
              <button onClick={() => setRevenueView('month')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${revenueView === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Month
              </button>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-slate-400">Verified Revenue (Paid only)</p>
            <p className="text-3xl font-bold text-orange-500">
              ₹{(revenueView === 'week' ? weekRevenue : monthRevenue).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp size={11} /> vs last {revenueView === 'week' ? 'week' : 'month'}
            </p>
          </div>
          <div className="flex items-end gap-2 h-28 mb-2 px-1">
            {chartData.map((d, i) => {
              const heightPct = maxRev > 0 ? Math.max((d.rev / maxRev) * 100, d.rev > 0 ? 8 : 3) : 3
              const isLast = i === chartData.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {d.rev > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                      ₹{d.rev.toLocaleString('en-IN')}
                    </div>
                  )}
                  <div className="w-full flex items-end" style={{ height: '112px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        d.isToday ? 'bg-orange-500' :
                        isLast && !d.isToday ? 'bg-orange-400' :
                        d.rev > 0 ? 'bg-orange-200 group-hover:bg-orange-300' : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between px-1">
            {chartData.map((d, i) => (
              <p key={i} className={`text-[10px] flex-1 text-center ${d.isToday ? 'text-orange-500 font-semibold' : 'text-slate-400'}`}>
                {d.label}
              </p>
            ))}
          </div>
        </div>

        {/* Today at a Glance */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-900 mb-4">Today at a Glance</h2>
          <div className="space-y-1">
            <button onClick={() => router.push('/dashboard/bookings')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogIn size={14} className="text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">Arrivals Today</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">{arrivalsToday}</span>
                <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500" />
              </div>
            </button>
            <button onClick={() => router.push('/dashboard/bookings')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut size={14} className="text-blue-600" />
                </div>
                <p className="text-sm text-slate-600">Departures Today</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">{departuresToday}</span>
                <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500" />
              </div>
            </button>
            <button onClick={() => router.push('/dashboard/bookings')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-violet-600" />
                </div>
                <p className="text-sm text-slate-600">Upcoming Bookings</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">{newBookingRequests}</span>
                <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500" />
              </div>
            </button>
            <button onClick={() => router.push('/dashboard/bookings')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-left group border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium">Pending Check-ins</p>
                  <p className="text-[10px] text-amber-600">Verify & click Check In</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-amber-700">{pendingPaymentBookings.length}</span>
                <ChevronRight size={13} className="text-amber-400 group-hover:text-amber-600" />
              </div>
            </button>
            <div className="relative overflow-hidden">
              <div className="w-full flex items-center justify-between p-2.5 rounded-xl text-left select-none">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingDown size={14} className="text-red-400" />
                  </div>
                  <p className="text-sm text-slate-400">Low Occupancy Properties</p>
                </div>
                <span className="text-sm font-bold text-slate-300">2</span>
              </div>
              <div className="absolute inset-0 backdrop-blur-[3px] bg-white/60 rounded-xl flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">🔒 Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Occupancy Donut */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-5 shadow-sm text-white">
          <h2 className="font-bold text-white mb-1">Live Occupancy</h2>
          <p className="text-xs text-slate-400 mb-3">Verified paid only</p>
          <div className="flex items-center justify-center my-2">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#334155" strokeWidth="14" />
                {occupancyRate > 0 && (
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#22c55e" strokeWidth="14"
                    strokeDasharray={`${(occupancyRate / 100) * 289} 289`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{occupancyRate}%</span>
                <span className="text-xs text-slate-400">Occupied</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-300">Occupied</span>
              </div>
              <span className="text-xs font-bold text-white">{occupiedBeds} Beds</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">Pending</span>
              </div>
              <span className="text-xs font-bold text-amber-400">{pendingPaymentBookings.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-xs text-slate-300">Available</span>
              </div>
              <span className="text-xs font-bold text-white">{availableBeds} Beds</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Beds</span>
              <span className="text-xs font-bold text-white">{totalBeds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Recent Bookings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Upcoming check-ins (tomorrow onwards)</p>
            </div>
            <button onClick={() => router.push('/dashboard/bookings')}
              className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-10 text-center">
              <Calendar size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No upcoming bookings</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentBookings.map(b => {
                const sc = getStatusConfig(b.status)
                const isPending = b.payment_status === 'pending'
                const initials = b.guest_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div key={b.id} onClick={() => router.push('/dashboard/bookings')}
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isPending ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-amber-100' : 'bg-orange-100'}`}>
                      <span className={`text-xs font-bold ${isPending ? 'text-amber-600' : 'text-orange-600'}`}>{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{b.guest_name}</p>
                        {isPending && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">⏳ Verify</span>}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{b.property_name || '—'} · {fmtDate(b.check_in)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">₹{Number(b.final_amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Property Ranking</h2>
              <p className="text-xs text-slate-400 mt-0.5">By verified income this month</p>
            </div>
            <button onClick={() => router.push('/dashboard/properties')}
              className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {propRanking.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No properties yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {propRanking.slice(0, 5).map((p, i) => {
                const rankColors = ['bg-orange-500', 'bg-slate-400', 'bg-amber-600', 'bg-slate-200', 'bg-slate-100']
                const rankTextColors = ['text-white', 'text-white', 'text-white', 'text-slate-600', 'text-slate-500']
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`w-6 h-6 ${rankColors[i] || 'bg-slate-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-[11px] font-bold ${rankTextColors[i] || 'text-slate-500'}`}>{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${p.occ}%` }} />
                        </div>
                        <p className="text-xs text-slate-400">{p.occ}% occ.</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">₹{p.income.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400">{p.activeBookings}/{p.total_beds} beds</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-slate-300 pb-2">© {new Date().getFullYear()} HostOps. All rights reserved.</p>
    </div>
  )
}
