"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Calendar,
  TrendingUp,
  FileText,
  Mail,
  Globe,
  Settings,
  Crown,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/rooms", label: "Rooms & Beds", icon: BedDouble },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/revenue", label: "Revenue & Collections", icon: TrendingUp },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/email", label: "Email Automation", icon: Mail },
  { href: "/dashboard/sources", label: "Booking Sources", icon: Globe },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/subscription", label: "Subscription", icon: Crown },
  { href: "/dashboard/coming-soon", label: "Coming Soon", icon: Sparkles },
];

export default function Sidebar({ ownerName }: { ownerName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 gradient-orange text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 gradient-sidebar text-white z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center shadow-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">HostOps</span>
                <p className="text-xs text-slate-400">Property Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-white/10">
            <div className="mb-3 px-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Logged in as</p>
              <p className="font-semibold text-white truncate">{ownerName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 w-full"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
