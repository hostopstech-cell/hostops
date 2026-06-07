"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Globe, TrendingUp, DollarSign } from "lucide-react";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6"];

export default function BookingSourcesPage() {
  const sourceData = [
    { name: "Direct", bookings: 145, revenue: 435000, percentage: 43 },
    { name: "Airbnb", bookings: 89, revenue: 312000, percentage: 29 },
    { name: "Walk-in", bookings: 67, revenue: 134000, percentage: 19 },
    { name: "Booking.com", bookings: 34, revenue: 102000, percentage: 9 },
  ];

  const pieData = sourceData.map((item) => ({
    name: item.name,
    value: item.percentage,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Booking Sources</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Track where your bookings come from
        </p>
      </div>

      {/* Pie Chart */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Source Distribution</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Source Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sourceData.map((source, index) => (
          <div key={source.name} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
                <Globe size={24} style={{ color: COLORS[index % COLORS.length] }} />
              </div>
              <span className="text-3xl font-bold text-slate-900">{source.percentage}%</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{source.name}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp size={14} />
                <span>{source.bookings} bookings</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign size={14} />
                <span>₹{source.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-6">
          <h2 className="text-xl font-bold text-slate-900">Source Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Bookings</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">% Contribution</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((source, index) => (
                <tr key={source.name} className="table-row">
                  <td className="px-6 py-3 font-bold text-slate-900">{source.name}</td>
                  <td className="px-6 py-3 text-slate-600">{source.bookings}</td>
                  <td className="px-6 py-3 text-slate-600">₹{source.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${source.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                        {source.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
