"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Globe, TrendingUp, DollarSign } from "lucide-react";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6"];

export default function BookingSourcesPage() {
  const [loading, setLoading] = useState(true);
  const [sourceData, setSourceData] = useState<{
    name: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }[]>([]);

  useEffect(() => {
    async function fetchBookingSources() {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        
        if (data.bookings) {
          const bookings = data.bookings;
          
          // Group bookings by source (assuming source field exists in bookings table)
          const sourceMap = new Map<string, { bookings: number; revenue: number }>();
          
          bookings.forEach((booking: any) => {
            const source = booking.source || 'Direct';
            if (!sourceMap.has(source)) {
              sourceMap.set(source, { bookings: 0, revenue: 0 });
            }
            const current = sourceMap.get(source)!;
            current.bookings++;
            current.revenue += parseFloat(booking.total_amount || 0);
          });
          
          const totalBookings = bookings.length;
          const totalRevenue = bookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount || 0), 0);
          
          const sources = Array.from(sourceMap.entries()).map(([name, data]) => ({
            name,
            bookings: data.bookings,
            revenue: data.revenue,
            percentage: totalBookings > 0 ? Math.round((data.bookings / totalBookings) * 100) : 0,
          }));
          
          setSourceData(sources);
        }
      } catch (error) {
        console.error('Error fetching booking sources:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookingSources();
  }, []);

  const pieData = sourceData.map((item) => ({
    name: item.name,
    value: item.percentage,
  }));

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading booking sources...</p>
      </div>
    );
  }

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
