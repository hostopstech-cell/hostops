'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    todayCheckins: 0,
    todayCheckouts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => { if (data && !data.error) setStats(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Properties</p>
          <p className="text-3xl font-bold text-orange-500">{stats.totalProperties}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Beds</p>
          <p className="text-3xl font-bold text-blue-500">{stats.totalBeds}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Available Beds</p>
          <p className="text-3xl font-bold text-green-500">{stats.availableBeds}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Occupancy</p>
          <p className="text-3xl font-bold text-purple-500">{stats.occupancyRate}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Today Revenue</p>
          <p className="text-3xl font-bold text-orange-500">₹{stats.todayRevenue}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Month Revenue</p>
          <p className="text-3xl font-bold text-blue-500">₹{stats.monthRevenue}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Today Check-ins</p>
          <p className="text-3xl font-bold text-green-500">{stats.todayCheckins}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Today Check-outs</p>
          <p className="text-3xl font-bold text-red-500">{stats.todayCheckouts}</p>
        </div>
      </div>
    </div>
  )
}
