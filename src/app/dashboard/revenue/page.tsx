"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Building2, DollarSign, Globe } from "lucide-react";
import { formatDate } from "@/lib/format";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    bySource: [] as { name: string; revenue: number; value: number }[],
    trend: [] as { date: string; revenue: number }[],
    recentCollections: [] as { id: number; guest_name: string; amount: number; check_in: string; status: string }[],
  });

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        
        if (data.bookings) {
          const bookings = data.bookings;
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          
          // Calculate collections by time period based on check_in date
          const dailyCollection = bookings
            .filter((b: any) => b.check_in === todayStr && b.status !== 'cancelled')
            .reduce((sum: number, b: any) => sum + parseFloat(b.final_amount || b.amount || 0), 0);
          
          const weeklyCollection = bookings
            .filter((b: any) => b.check_in >= weekAgo && b.status !== 'cancelled')
            .reduce((sum: number, b: any) => sum + parseFloat(b.final_amount || b.amount || 0), 0);
          
          const monthlyCollection = bookings
            .filter((b: any) => b.check_in >= monthStart && b.status !== 'cancelled')
            .reduce((sum: number, b: any) => sum + parseFloat(b.final_amount || b.amount || 0), 0);
          
          const yearlyCollection = bookings
            .filter((b: any) => b.check_in >= yearStart && b.status !== 'cancelled')
            .reduce((sum: number, b: any) => sum + parseFloat(b.final_amount || b.amount || 0), 0);
          
          // Collection by source
          const sourceMap = new Map<string, number>();
          bookings.forEach((booking: any) => {
            if (booking.status === 'cancelled') return;
            const source = booking.booking_source || 'Direct';
            const amount = parseFloat(booking.final_amount || booking.amount || 0);
            sourceMap.set(source, (sourceMap.get(source) || 0) + amount);
          });
          
          const totalCollection = Array.from(sourceMap.values()).reduce((sum, val) => sum + val, 0);
          const bySource = Array.from(sourceMap.entries()).map(([name, revenue]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
            revenue,
            value: totalCollection > 0 ? Math.round((revenue / totalCollection) * 100) : 0,
          }));
          
          // Trend data for last 30 days
          const trend: { date: string; revenue: number }[] = [];
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dayRevenue = bookings
              .filter((b: any) => b.check_in === date && b.status !== 'cancelled')
              .reduce((sum: number, b: any) => sum + parseFloat(b.final_amount || b.amount || 0), 0);
            trend.push({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: dayRevenue });
          }
          
          // Recent collections (last 10 bookings)
          const recentCollections = bookings
            .filter((b: any) => b.status !== 'cancelled')
            .slice(0, 10)
            .map((b: any) => ({
              id: b.id,
              guest_name: b.guest_name,
              amount: parseFloat(b.final_amount || b.amount || 0),
              check_in: b.check_in,
              status: b.status,
            }));
          
          setRevenueData({
            daily: dailyCollection,
            weekly: weeklyCollection,
            monthly: monthlyCollection,
            yearly: yearlyCollection,
            bySource,
            trend,
            recentCollections,
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
        <h1 className="text-3xl font-bold text-slate-900">Revenue & Collections</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Track your collections and financial performance
        </p>
      </div>

      {/* Collection Cards */}
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
          <p className="mt-1 text-sm text-slate-500">Daily collection</p>
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
          <p className="mt-1 text-sm text-slate-500">Weekly collection</p>
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
          <p className="mt-1 text-sm text-slate-500">Monthly collection</p>
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
          <p className="mt-1 text-sm text-slate-500">Yearly collection</p>
        </div>
      </div>

      {/* Collection Trend Chart */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Collection Trend (Last 30 Days)</h2>
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
        {/* Collection by Source */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Collection by Source</h2>
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

        {/* Recent Collections */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Collections</h2>
          {revenueData.recentCollections.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No collections yet</p>
          ) : (
            <div className="space-y-3">
              {revenueData.recentCollections.map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Globe size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{collection.guest_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(collection.check_in)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{collection.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 capitalize">{collection.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
