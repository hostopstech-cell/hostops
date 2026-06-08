"use client";

import { Globe, Calendar, IndianRupee, TrendingUp, Lock, BarChart2, List } from "lucide-react";

const statCards = [
  { id: "sources", label: "Total Sources", icon: Globe, iconColor: "text-orange-400", iconBg: "bg-orange-100" },
  { id: "bookings", label: "Total Bookings", icon: Calendar, iconColor: "text-blue-400", iconBg: "bg-blue-100" },
  { id: "revenue", label: "Total Revenue", icon: IndianRupee, iconColor: "text-green-500", iconBg: "bg-green-100" },
  { id: "top", label: "Top Source", icon: TrendingUp, iconColor: "text-purple-400", iconBg: "bg-purple-100" },
];

export default function BookingSourcesPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Sources</h1>
        <p className="text-gray-500 mt-1">Track where your bookings come from</p>
      </div>

      {/* Coming Soon Hero Banner */}
      <div className="mb-6 rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Ghost background icons */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-10">
          <List className="w-24 h-24 text-gray-400" />
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 flex gap-4">
          <Globe className="w-20 h-20 text-gray-400" />
          <BarChart2 className="w-20 h-20 text-gray-400" />
        </div>

        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 z-10">
          <Lock className="w-7 h-7 text-orange-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 z-10">Coming Soon</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm z-10">
          Detailed booking source analytics is coming soon. You will be able to
          track performance across all your booking channels.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-300 mb-3">--</p>
              <button
                disabled
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-xs cursor-not-allowed"
              >
                <Lock className="w-3 h-3" />
                Coming Soon
              </button>
            </div>
          );
        })}
      </div>

      {/* Source Details Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Source Details</h2>
          <button
            disabled
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-xs cursor-not-allowed"
          >
            <Lock className="w-3 h-3" />
            Coming Soon
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-3 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Source</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bookings</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Revenue</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">% Contribution</span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-orange-400" />
          </div>
          <p className="font-semibold text-gray-900">Coming Soon</p>
          <p className="text-sm text-gray-500">Source-wise performance table will be available soon.</p>
        </div>
      </div>
    </div>
  );
}