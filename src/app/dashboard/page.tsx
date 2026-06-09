'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBeds: 0,
    soldBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    weekRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [userName, setUserName] = useState("Owner")
  const [loading, setLoading] = useState(true)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
    ]).then(([dashData, bookingsData, propsData]) => {
      if (dashData && !dashData.error) setStats(dashData)
      if (bookingsData?.bookings) {
        const bks = bookingsData.bookings;
        setRecentBookings(bks.slice(0, 4));
        setAllBookings(bks);
        const todayStr = new Date().toLocaleDateString('en-CA');
        const getD = (d: string) => d ? new Date(d).toLocaleDateString('en-CA') : '';
        const month = new Date().toISOString().slice(0, 7);
        const todayRev = bks.filter((b) => getD(b.check_in) === todayStr).reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);
        const monthRev = bks.filter((b: any) => b.check_in?.startsWith(month)).reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);
        const todayCheckins = bks.filter((b: any) => getD(b.check_in) === todayStr).length;
        const todayCheckouts = bks.filter((b: any) => getD(b.check_out) === todayStr).length;
        // Week revenue: last 7 days
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);
        const weekRev = bks.filter((b: any) => b.check_in && new Date(b.check_in) >= weekStart).reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);
        setStats((prev) => ({ ...prev, todayRevenue: todayRev, monthRevenue: monthRev, weekRevenue: weekRev, todayCheckins, todayCheckouts }));
      }
      if (propsData?.properties) setProperties(propsData.properties)
    }).catch(() => {}).finally(() => setLoading(false))

    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data?.name) setUserName(data.name.split(' ')[0])
    }).catch(() => {})
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'checked_in': return 'bg-blue-100 text-blue-700'
      case 'checked_out': return 'bg-slate-100 text-slate-600'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'checked_in': return 'Checked In'
      case 'checked_out': return 'Checked Out'
      case 'cancelled': return 'Cancelled'
      default: return 'Pending'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your properties today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-4 py-2 w-fit">
          📅 {today}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Occupancy",
            value: `${stats.occupancyRate}%`,
            change: "vs yesterday",
            icon: "👥",
            color: "text-purple-600",
            bg: "bg-purple-50",
            path: '/dashboard/coming-soon'
          },
          {
            label: "Available Beds",
            value: stats.availableBeds,
            change: "vs yesterday",
            icon: "🛏️",
            color: "text-green-600",
            bg: "bg-green-50",
            path: '/dashboard/rooms'
          },
          {
            label: "Today's Revenue",
            value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,
            change: "vs yesterday",
            icon: "💰",
            color: "text-orange-600",
            bg: "bg-orange-50",
            path: '/dashboard/revenue'
          },
          {
            label: "Today's Check-ins",
            value: stats.todayCheckins,
            change: "vs yesterday",
            icon: "✅",
            color: "text-blue-600",
            bg: "bg-blue-50",
            path: '/dashboard/bookings'
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => router.push(card.path)}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center text-sm`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Revenue Overview</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">This Week</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">This Week</p>
              <p className="text-2xl font-bold text-orange-600">₹{(stats as any).weekRevenue?.toLocaleString('en-IN') || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">This Month</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.monthRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          {/* Real 7-day bar chart */}
          {(() => {
            const days = Array.from({length: 7}, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
              const dStr = d.toLocaleDateString('en-CA');
              const rev = allBookings.filter((b: any) => b.check_in && new Date(b.check_in).toLocaleDateString('en-CA') === dStr).reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);
              return { day: d.toLocaleDateString('en-IN', {weekday:'short'}), rev };
            });
            const maxRev = Math.max(...days.map(d => d.rev), 1);
            return (
              <>
                <div className="flex items-end gap-1 h-24">
                  {days.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        ₹{d.rev.toLocaleString('en-IN')}
                      </div>
                      <div
                        className={`w-full rounded-t-sm ${i === 6 ? 'bg-orange-500' : 'bg-orange-200'}`}
                        style={{ height: `${Math.max((d.rev / maxRev) * 100, d.rev > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {days.map((d, i) => (
                    <p key={i} className="text-xs text-slate-400 flex-1 text-center">{d.day}</p>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Today's Activity</h2>
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="text-xs text-orange-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {[
              { icon: "✅", label: "Check-ins", value: stats.todayCheckins, color: "bg-green-50" },
              { icon: "🚪", label: "Check-outs", value: stats.todayCheckouts, color: "bg-red-50" },
              { icon: "📋", label: "Total Bookings", value: recentBookings.length, color: "bg-blue-50" },
              { icon: "🏠", label: "Properties", value: stats.totalProperties, color: "bg-orange-50" },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => router.push('/dashboard/bookings')}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-sm`}>
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  <span className="text-slate-300">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings + Property Performance */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Bookings</h2>
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="text-xs text-orange-600 hover:underline"
            >
              View All
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No bookings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500">
                    <th className="px-4 py-3 text-left">Guest</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Check-in</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => router.push('/dashboard/bookings')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                            {b.guest_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-xs">{b.guest_name}</p>
                            <p className="text-slate-400 text-xs">{b.guest_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">{b.check_in}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium text-xs hidden md:table-cell">₹{b.final_amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Property Performance */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Property Performance</h2>
          </div>
          {properties.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-4">No properties yet</div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 4).map((prop: any, i: number) => {
                const totalBeds = prop.total_beds || prop.totalBeds || 0;
                const activeBookings = allBookings.filter((b: any) =>
                  String(b.property_id) === String(prop.id) &&
                  ['confirmed','checked_in'].includes(b.status)
                ).length;
                const occupancy = totalBeds > 0 ? Math.min(Math.round((activeBookings / totalBeds) * 100), 100) : 0;
                const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
                return (
                  <div key={prop.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-xs">🏠</div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[100px]">{prop.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{occupancy}%</p>
                        <p className="text-xs text-slate-400">{activeBookings}/{totalBeds} beds</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`${colors[i % colors.length]} h-1.5 rounded-full transition-all`} style={{ width: `${occupancy}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard/properties')}
            className="w-full mt-4 text-sm text-orange-600 font-semibold border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition-colors"
          >
            View All Properties
          </button>
        </div>
      </div>
    </div>
  )
}
