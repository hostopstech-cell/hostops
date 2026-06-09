"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.owner) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">Powerful Features</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Everything You Need to<br />
              Manage <span className="text-orange-600">Smarter</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              HostOps brings all the tools you need to manage your properties, guests, bookings, and operations — in one powerful platform.
            </p>
            <div className="flex flex-row gap-4">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                🏠 Owner Login
              </Link>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                📊 View Dashboard
              </Link>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-400 text-xs ml-2">HostOps Dashboard</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total Bookings", value: "128", change: "+12%" },
                  { label: "Occupancy Today", value: "76%", change: "+8%" },
                  { label: "Today's Revenue", value: "₹24,750", change: "+15%" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-700 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">{s.label}</p>
                    <p className="text-white font-bold text-lg">{s.value}</p>
                    <p className="text-green-400 text-xs">{s.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
