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
    return (
      <div className="card p-12 text-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Track your revenue and financial performance
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.daily.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Daily revenue</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.weekly.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Weekly revenue</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-green flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.monthly.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Monthly revenue</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-purple flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Yearly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{(revenueData.yearly / 100000).toFixed(1)}L
          </p>
          <p className="mt-1 text-sm text-slate-500">Yearly revenue</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={revenueData.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Revenue by Property */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue by Property</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenueData.byProperty}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Bar dataKey="revenue" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Source */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue by Source</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={revenueData.bySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueData.bySource.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Monthly Comparison</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={revenueData.monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Bar dataKey="revenue" fill="#F97316" name="This Year" radius={[8, 8, 0, 0]} />
            <Bar dataKey="lastYear" fill="#94A3B8" name="Last Year" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
