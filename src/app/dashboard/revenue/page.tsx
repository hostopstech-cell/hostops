"use client";
import { getCurrencySymbol } from '@/lib/currency-utils';

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Building2, DollarSign, Globe } from "lucide-react";
import { formatDate } from "@/lib/format";
import Link from "next/link";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

type TrendRange = "7" | "30" | "90";

export default function RevenuePage() {
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState<TrendRange>("30");
  const [revenueData, setRevenueData] = useState({
    daily: 0, weekly: 0, monthly: 0, yearly: 0,
    dailyPrev: 0, weeklyPrev: 0, monthlyPrev: 0, yearlyPrev: 0,
    bySource: [] as { name: string; revenue: number; value: number }[],
    trend30: [] as { date: string; revenue: number }[],
    trend7: [] as { date: string; revenue: number }[],
    trend90: [] as { date: string; revenue: number }[],
    recentCollections: [] as {
      id: number; booking_code: string; guest_name: string;
      amount: number; check_in: string; status: string;
    }[],
  });

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol());
    async function fetchRevenueData() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (data.bookings) {
          const bookings = data.bookings;
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];

          const daysAgo = (n: number) =>
            new Date(today.getTime() - n * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
          const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
          const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
          const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
          const prevYearStart = new Date(today.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
          const prevYearEnd = new Date(today.getFullYear() - 1, 11, 31).toISOString().split("T")[0];

          const toDate = (d: string) => d?.slice(0, 10) || '';

          // KEY FIX: payment_status === 'paid' filter added everywhere
          const sum = (bks: any[], from: string, to: string) =>
            bks
              .filter((b: any) =>
                toDate(b.check_in) >= from &&
                toDate(b.check_in) <= to &&
                b.status !== "cancelled" &&
                b.payment_status === "paid"
              )
              .reduce((s: number, b: any) => s + parseFloat(b.final_amount || b.amount || 0), 0);

          const daily = sum(bookings, todayStr, todayStr);
          const dailyPrev = sum(bookings, daysAgo(1), daysAgo(1));
          const weekly = sum(bookings, daysAgo(7), todayStr);
          const weeklyPrev = sum(bookings, daysAgo(14), daysAgo(8));
          const monthly = sum(bookings, monthStart, todayStr);
          const monthlyPrev = sum(bookings, prevMonthStart, prevMonthEnd);
          const yearly = sum(bookings, yearStart, todayStr);
          const yearlyPrev = sum(bookings, prevYearStart, prevYearEnd);

          // By source: sirf paid
          const sourceMap = new Map<string, number>();
          bookings.forEach((b: any) => {
            if (b.status === "cancelled" || b.payment_status !== "paid") return;
            const src = b.booking_source || "direct";
            sourceMap.set(src, (sourceMap.get(src) || 0) + parseFloat(b.final_amount || b.amount || 0));
          });
          const totalAmt = Array.from(sourceMap.values()).reduce((s, v) => s + v, 0);
          const bySource = Array.from(sourceMap.entries()).map(([name, revenue]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
            revenue,
            value: totalAmt > 0 ? Math.round((revenue / totalAmt) * 100) : 0,
          }));

          // Trend: sirf paid
          const buildTrend = (days: number) => {
            const arr = [];
            for (let i = days - 1; i >= 0; i--) {
              const date = daysAgo(i);
              const dayRev = bookings
                .filter((b: any) =>
                  toDate(b.check_in) === date &&
                  b.status !== "cancelled" &&
                  b.payment_status === "paid"
                )
                .reduce((s: number, b: any) => s + parseFloat(b.final_amount || b.amount || 0), 0);
              arr.push({
                date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                revenue: dayRev,
              });
            }
            return arr;
          };

          // Recent collections: sirf paid
          const recentCollections = bookings
            .filter((b: any) => b.status !== "cancelled" && b.payment_status === "paid")
            .slice(0, 8)
            .map((b: any) => ({
              id: b.id,
              booking_code: b.booking_code || "",
              guest_name: b.guest_name,
              amount: parseFloat(b.final_amount || b.amount || 0),
              check_in: b.check_in,
              status: b.status,
            }));

          setRevenueData({
            daily, dailyPrev, weekly, weeklyPrev,
            monthly, monthlyPrev, yearly, yearlyPrev,
            bySource,
            trend7: buildTrend(7),
            trend30: buildTrend(30),
            trend90: buildTrend(90),
            recentCollections,
          });
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenueData();
  }, []);

  function pctChange(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  }

  const trendData = trendRange === "7" ? revenueData.trend7 : trendRange === "90" ? revenueData.trend90 : revenueData.trend30;

  const STATUS_STYLES: Record<string, string> = {
    checked_in: "text-emerald-600",
    checked_out: "text-slate-500",
    confirmed: "text-blue-600",
    pending: "text-yellow-600",
    cancelled: "text-red-500",
  };
  const STATUS_LABELS: Record<string, string> = {
    checked_in: "Checked In",
    checked_out: "Checked Out",
    confirmed: "Upcoming",
    pending: "Pending",
    cancelled: "Cancelled",
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading revenue data...</p>
      </div>
    );
  }

  const cards = [
    { label: "Daily Collection", sub: "Today", value: revenueData.daily, prev: revenueData.dailyPrev, compareLabel: "vs yesterday", color: "border-l-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600", Icon: Calendar, format: (v: number) => `${currencySymbol}${v.toLocaleString("en-IN")}` },
    { label: "Weekly Collection", sub: "This Week", value: revenueData.weekly, prev: revenueData.weeklyPrev, compareLabel: "vs last week", color: "border-l-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600", Icon: TrendingUp, format: (v: number) => `${currencySymbol}${v.toLocaleString("en-IN")}` },
    { label: "Monthly Collection", sub: "This Month", value: revenueData.monthly, prev: revenueData.monthlyPrev, compareLabel: "vs last month", color: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", Icon: DollarSign, format: (v: number) => `${currencySymbol}${v.toLocaleString("en-IN")}` },
    { label: "Yearly Collection", sub: "This Year", value: revenueData.yearly, prev: revenueData.yearlyPrev, compareLabel: "vs last year", color: "border-l-purple-500", iconBg: "bg-purple-50", iconColor: "text-purple-600", Icon: Building2, format: (v: number) => `${currencySymbol}${(v / 100000).toFixed(1)}L` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue & Collections</h1>
        <p className="mt-2 text-slate-600 text-lg">Track your collections and financial performance</p>
      </div>

      {/* Collection Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const pct = pctChange(card.value, card.prev);
          const isUp = pct >= 0;
          return (
            <div key={card.label} className={`stat-card border-l-4 ${card.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.Icon size={24} className={card.iconColor} />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.format(card.value)}</p>
              <p className="mt-1 text-sm text-slate-500">{card.label}</p>
              <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isUp ? "+" : ""}{pct}% {card.compareLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collection Trend Chart */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Collection Trend</h2>
          <select value={trendRange} onChange={(e) => setTrendRange(e.target.value as TrendRange)} className="input-field w-auto text-sm">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              formatter={(value: number) => [`${currencySymbol}${value.toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Collection by Source */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Collection by Source</h2>
          {revenueData.bySource.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No paid collections yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={revenueData.bySource} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={110} dataKey="value">
                    {revenueData.bySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                    formatter={(value: number, name: string, props: any) => [`${currencySymbol}${props.payload.revenue.toLocaleString("en-IN")} (${value}%)`, props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {revenueData.bySource.map((src, i) => (
                  <div key={src.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-700 font-medium">{src.name}</span>
                    </div>
                    <span className="text-slate-500">{currencySymbol}{src.revenue.toLocaleString("en-IN")} ({src.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Collections */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Collections</h2>
            <Link href="/dashboard/bookings" className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">View All</Link>
          </div>
          {revenueData.recentCollections.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No paid collections yet</p>
          ) : (
            <div className="space-y-3">
              {revenueData.recentCollections.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{c.guest_name}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(c.check_in)}
                        {c.booking_code && <span className="ml-2 font-mono text-slate-500">• {c.booking_code}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{currencySymbol}{c.amount.toLocaleString("en-IN")}</p>
                    <p className={`text-xs font-medium capitalize ${STATUS_STYLES[c.status] ?? "text-slate-500"}`}>
                      {STATUS_LABELS[c.status] ?? c.status.replace("_", " ")}
                    </p>
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
