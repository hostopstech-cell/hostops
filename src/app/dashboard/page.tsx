import { getAuthenticatedOwner } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import StatCard from "@/components/StatCard";
import { formatINR, formatDate, capitalize } from "@/lib/format";
import Link from "next/link";
import { Plus, TrendingUp, Users, BedDouble, Calendar, CreditCard, Building2 } from "lucide-react";

export default async function DashboardPage() {
  const owner = await getAuthenticatedOwner();
  if (!owner) return null;

  let data;
  try {
    data = await getDashboardStats(owner.ownerId);
  } catch {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load dashboard data. Make sure the database is initialized.
      </div>
    );
  }

  const hasProperties = data.properties.length > 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="gradient-orange rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {owner.name}!</h1>
        <p className="text-white/90 text-lg">
          Here's what's happening with your properties today
        </p>
      </div>

      {!hasProperties && (
        <div className="card p-8 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg">
                Welcome to HostOps!
              </p>
              <p className="text-slate-600 mt-1">
                Get started by adding your first property to begin managing your hospitality business.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/properties"
            className="mt-6 inline-flex items-center gap-2 btn-primary"
          >
            <Plus size={18} />
            Add Property
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Properties</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.totalProperties}</p>
          <p className="mt-1 text-sm text-slate-500">Active properties</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center">
              <BedDouble size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beds</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.totalBeds}</p>
          <p className="mt-1 text-sm text-slate-500">Across all properties</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-green flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.occupancyRate}%</p>
          <p className="mt-1 text-sm text-slate-500">{data.occupiedBeds} of {data.totalBeds} beds</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-purple flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatINR(data.revenueToday)}</p>
          <p className="mt-1 text-sm text-slate-500">Today's revenue</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-slate flex items-center justify-center">
              <BedDouble size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.availableBeds}</p>
          <p className="mt-1 text-sm text-slate-500">Ready for booking</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-ins</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.checkinsToday}</p>
          <p className="mt-1 text-sm text-slate-500">{data.checkoutsToday} check-outs</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-green flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatINR(data.revenueMonth)}</p>
          <p className="mt-1 text-sm text-slate-500">This month</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupied</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.occupiedBeds}</p>
          <p className="mt-1 text-sm text-slate-500">Currently occupied</p>
        </div>
      </div>

      {/* Quick Actions */}
      {hasProperties && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/bookings"
              className="btn-primary flex items-center gap-2"
            >
              <Calendar size={18} />
              New Booking
            </Link>
            <Link
              href="/dashboard/rooms"
              className="btn-secondary flex items-center gap-2"
            >
              <BedDouble size={18} />
              Add Room
            </Link>
            <Link
              href="/dashboard/guests"
              className="btn-secondary flex items-center gap-2"
            >
              <Users size={18} />
              Add Guest
            </Link>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card">
        <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
          >
            View All →
          </Link>
        </div>
        {data.recentBookings.length === 0 ? (
          <p className="px-6 py-12 text-sm text-slate-500 text-center">
            No bookings yet. Create your first booking to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Booking Code</th>
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Check-in</th>
                  <th className="px-6 py-3">Check-out</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="table-row"
                  >
                    <td className="px-6 py-3 font-semibold text-orange-600">
                      {booking.booking_code}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {booking.guest_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {booking.property_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(booking.check_in)}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(booking.check_out)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`${
                          booking.status === "confirmed"
                            ? "badge-info"
                            : booking.status === "checked_in"
                            ? "badge-success"
                            : booking.status === "checked_out"
                            ? "bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold"
                            : booking.status === "cancelled"
                            ? "badge-error"
                            : "badge-warning"
                        }`}
                      >
                        {capitalize(booking.status.replace("_", " "))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Check-ins */}
      <div className="card">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s Check-ins
          </h2>
        </div>
        {data.todaysCheckins.length === 0 ? (
          <p className="px-6 py-12 text-sm text-slate-500 text-center">
            No check-ins scheduled for today.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Check-in</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todaysCheckins.map((checkin) => (
                  <tr
                    key={checkin.id}
                    className="table-row"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {checkin.guest_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {checkin.property_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(checkin.check_in)}
                    </td>
                    <td className="px-6 py-3">
                      <span className="badge-success">
                        {capitalize(checkin.status.replace("_", " "))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Check-outs */}
      <div className="card">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s Check-outs
          </h2>
        </div>
        {data.todaysCheckouts.length === 0 ? (
          <p className="px-6 py-12 text-sm text-slate-500 text-center">
            No check-outs scheduled for today.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Check-out</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todaysCheckouts.map((checkout) => (
                  <tr
                    key={checkout.id}
                    className="table-row"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {checkout.guest_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {checkout.property_name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(checkout.check_out)}
                    </td>
                    <td className="px-6 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {capitalize(checkout.status.replace("_", " "))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Properties Overview */}
      {hasProperties && (
        <div className="card">
          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Properties
            </h2>
            <Link
              href="/dashboard/properties"
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.properties.map((property) => (
              <div
                key={property.id}
                className="card p-5 hover:border-orange-300 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg icon-bg-orange flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{property.name}</p>
                    <p className="text-xs text-slate-500">
                      {capitalize(property.type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>{property.city}, {property.state}</span>
                  <span className="text-slate-400">•</span>
                  <span>{property.total_beds} beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
