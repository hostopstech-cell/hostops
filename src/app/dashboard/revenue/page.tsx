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
    async function fetchRevenueData() {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        
        if (data.payments) {
          const payments = data.payments;
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          
          // Calculate revenue by time period
          const dailyRevenue = payments
            .filter((p: any) => p.date === todayStr && p.status === 'paid')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          
          const weeklyRevenue = payments
            .filter((p: any) => p.date >= weekAgo && p.status === 'paid')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          
          const monthlyRevenue = payments
            .filter((p: any) => p.date >= monthStart && p.status === 'paid')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          
          const yearlyRevenue = payments
            .filter((p: any) => p.date >= yearStart && p.status === 'paid')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          
          // Revenue by property (need to join with bookings)
          const byProperty: { name: string; revenue: number }[] = [];
          
          // Revenue by source (need booking source data)
          const bySource: { name: string; revenue: number; value: number }[] = [];
          
          // Trend data for last 30 days
          const trend: { date: string; revenue: number }[] = [];
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dayRevenue = payments
              .filter((p: any) => p.date === date && p.status === 'paid')
              .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
            trend.push({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: dayRevenue });
          }
          
          // Monthly comparison (last 6 months)
          const monthlyComparison: { month: string; revenue: number; lastYear: number }[] = [];
          for (let i = 5; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = month.toLocaleDateString('en-US', { month: 'short' });
            const monthStartStr = month.toISOString().split('T')[0];
            const monthEndStr = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const revenue = payments
              .filter((p: any) => p.date >= monthStartStr && p.date <= monthEndStr && p.status === 'paid')
              .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
            
            // Last year same month
            const lastYearMonth = new Date(month.getFullYear() - 1, month.getMonth(), 1);
            const lastYearStart = lastYearMonth.toISOString().split('T')[0];
            const lastYearEnd = new Date(lastYearMonth.getFullYear(), lastYearMonth.getMonth() + 1, 0).toISOString().split('T')[0];
            const lastYearRevenue = payments
              .filter((p: any) => p.date >= lastYearStart && p.date <= lastYearEnd && p.status === 'paid')
              .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
            
            monthlyComparison.push({ month: monthStr, revenue, lastYear: lastYearRevenue });
          }
          
          setRevenueData({
            daily: dailyRevenue,
            weekly: weeklyRevenue,
            monthly: monthlyRevenue,
            yearly: yearlyRevenue,
            byProperty,
            bySource,
            trend,
            monthlyComparison,
          });
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRevenueData();
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
        <div className="stat-card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Calendar size={24} className="text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.daily.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Daily revenue</p>
        </div>
        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.weekly.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Weekly revenue</p>
        </div>
        <div className="stat-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{revenueData.monthly.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Monthly revenue</p>
        </div>
        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Building2 size={24} className="text-purple-600" />
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
