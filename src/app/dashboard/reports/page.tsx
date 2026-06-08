"use client";

import { useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Lock,
  Download,
  FileText,
  BarChart2,
  PieChart,
} from "lucide-react";

const reports = [
  {
    id: "occupancy",
    title: "Occupancy Report",
    description: "Track occupancy rates across your properties",
    icon: Users,
    chartIcon: BarChart2,
    filters: ["Daily", "Weekly", "Monthly"],
    color: "orange",
    comingSoon: true,
  },
  {
    id: "revenue",
    title: "Revenue Report",
    description: "Analyze revenue trends and financial performance",
    icon: DollarSign,
    chartIcon: TrendingUp,
    filters: ["Daily", "Weekly", "Monthly", "Yearly"],
    color: "orange",
    comingSoon: true,
  },
  {
    id: "booking-source",
    title: "Booking Source Report",
    description: "Understand where your bookings come from",
    icon: TrendingUp,
    chartIcon: PieChart,
    filters: ["Monthly", "Yearly"],
    color: "orange",
    comingSoon: true,
  },
  {
    id: "guest",
    title: "Guest Report",
    description: "Analyze guest demographics and behavior",
    icon: UserCheck,
    chartIcon: PieChart,
    filters: ["Monthly", "Yearly"],
    color: "orange",
    comingSoon: true,
  },
];

export default function ReportsPage() {
  const [activeFilters, setActiveFilters] = useState({});

  const toggleFilter = (reportId, filter) => {
    setActiveFilters((prev) => ({
      ...prev,
      [reportId]: filter,
    }));
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and export detailed reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const ChartIcon = report.chartIcon;
          const selectedFilter = activeFilters[report.id] || report.filters[0];

          return (
            <div
              key={report.id}
              className="border border-gray-200 rounded-2xl p-6 bg-white relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base">{report.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{report.description}</p>
                  </div>
                </div>
              </div>

              {/* Ghost chart background */}
              <div className="absolute right-4 top-4 opacity-10">
                <ChartIcon className="w-24 h-24 text-gray-400" />
              </div>

              {/* Coming Soon lock */}
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-gray-600">Coming Soon</span>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap">
                {report.filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(report.id, filter)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedFilter === filter
                        ? "bg-gray-100 border-gray-300 text-gray-800 font-medium"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Coming Soon CTA button */}
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Coming Soon
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom banner */}
      <div className="mt-8 rounded-2xl bg-orange-50 border border-orange-100 p-6 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Reports Section Coming Soon!</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            We're working hard to bring you powerful insights and advanced reporting. Stay tuned for upcoming updates.
          </p>
        </div>
      </div>
    </div>
  );
}