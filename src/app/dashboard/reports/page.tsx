"use client";

import { FileText, Download, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const reportTypes = [
    {
      id: "occupancy",
      title: "Occupancy Report",
      description: "Track occupancy rates across your properties",
      icon: Users,
      periods: ["Daily", "Weekly", "Monthly"],
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Analyze revenue trends and financial performance",
      icon: DollarSign,
      periods: ["Daily", "Weekly", "Monthly", "Yearly"],
    },
    {
      id: "booking-source",
      title: "Booking Source Report",
      description: "Understand where your bookings come from",
      icon: TrendingUp,
      periods: ["Monthly", "Yearly"],
    },
    {
      id: "guest",
      title: "Guest Report",
      description: "Analyze guest demographics and behavior",
      icon: Users,
      periods: ["Monthly", "Yearly"],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-slate-600">
          Generate and export detailed reports
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {report.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.periods.map((period) => (
                      <button
                        key={period}
                        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-colors"
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button className="btn-primary flex items-center gap-2 text-sm">
                  <FileText size={16} />
                  Generate
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-4">
          <Calendar className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-900">
              Export Options Coming Soon
            </h3>
            <p className="mt-1 text-sm text-orange-700">
              PDF and Excel export functionality will be available in future updates.
              For now, you can generate reports and print them directly from your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
