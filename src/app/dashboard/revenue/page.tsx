"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Building2, DollarSign } from "lucide-react";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    byProperty: [] as { name: string; revenue: number }[],
    bySource: [] as { name: string; revenue: number; value: number }[],
    trend: [] as { date: string; revenue: number }[],
    monthlyComparison: [] as { month: string; revenue: number; lastYear: number }[],
  });

  useEffect(() => {
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setRevenueData({
        daily: 12500,
        weekly: 87500,
        monthly: 345000,
        yearly: 4140000,
        byProperty: [
          { name: "Backpacker's Inn", revenue: 180000 },
          { name: "City Hostel", revenue: 120000 },
          { name: "Beach Guesthouse", revenue: 45000 },
        ],
        bySource: [
          { name: "Direct", revenue: 150000, value: 43 },
          { name: "Airbnb", revenue: 100000, value: 29 },
          { name: "Walk-in", revenue: 65000, value: 19 },
          { name: "Booking.com", revenue: 30000, value: 9 },
        ],
        trend: [
          { date: "Jan 1", revenue: 12000 },
          { date: "Jan 2", revenue: 15000 },
          { date: "Jan 3", revenue: 11000 },
          { date: "Jan 4", revenue: 18000 },
          { date: "Jan 5", revenue: 14000 },
          { date: "Jan 6", revenue: 16000 },
          { date: "Jan 7", revenue: 13000 },
          { date: "Jan 8", revenue: 17000 },
          { date: "Jan 9", revenue: 19000 },
          { date: "Jan 10", revenue: 12500 },
        ],
        monthlyComparison: [
          { month: "Jan", revenue: 280000, lastYear: 220000 },
          { month: "Feb", revenue: 310000, lastYear: 240000 },
          { month: "Mar", revenue: 345000, lastYear: 260000 },
          { month: "Apr", revenue: 290000, lastYear: 230000 },
          { month: "May", revenue: 320000, lastYear: 250000 },
          { month: "Jun", revenue: 350000, lastYear: 270000 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading revenue data...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
        <p className="mt-1 text-slate-600">
          Track your revenue and financial performance
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Daily Revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{revenueData.daily.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Weekly Revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{revenueData.weekly.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Monthly Revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{revenueData.monthly.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Yearly Revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{(revenueData.yearly / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Revenue by Property */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Property</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.byProperty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Source */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData.bySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueData.bySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData.monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#F97316" name="This Year" />
            <Bar dataKey="lastYear" fill="#94A3B8" name="Last Year" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
