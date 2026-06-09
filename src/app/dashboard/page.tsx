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
    recentBookings: [],
    propertyPerformance: [],
    todayCheckins: 0,
    todayCheckouts: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
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
        const bookings = bookingsData.bookings;
        setRecentBookings(bookings.slice(0, 4));
        const today = new Date().toISOString().split("T")[0];
        const thisMonth = new Date().toISOString().slice(0, 7);
        const todayRev = bookings.filter((b) => b.check_in?.startsWith(today)).reduce((s, b) => s + Number(b.final_amount || b.amount || 0), 0);
        const monthRev = bookings.filter((b) => b.check_in?.startsWith(thisMonth)).reduce((s, b) => s + Number(b.final_amount || b.amount || 0), 0);
        setStats((prev) => ({ ...prev, todayRevenue: todayRev, monthRevenue: monthRev }));
      }

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
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">This Month</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Today</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.todayRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">This Month</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.monthRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          {/* Simple Bar Chart */}
          <div className="flex items-end gap-1 h-24">
            {[40, 65, 45, 70, 55, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm ${i === 6 ? 'bg-orange-500' : 'bg-orange-200'}`}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <p key={d} className="text-xs text-slate-400 flex-1 text-center">{d}</p>
            ))}
          </div>
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
                      <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">{b.check_in ? new Date(b.check_in).toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"}) : "-"}</td>
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
                const occupancy = Math.floor(Math.random() * 40 + 50)
                const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
                return (
                  <div key={prop.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-xs">🏠</div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{prop.name}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{occupancy}%</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`${colors[i % colors.length]} h-1.5 rounded-full`} style={{ width: `${occupancy}%` }} />
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
