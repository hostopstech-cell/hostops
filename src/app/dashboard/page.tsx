import { getAuthenticatedOwner } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import StatCard from "@/components/StatCard";
import { formatINR, formatDate, capitalize } from "@/lib/format";
import Link from "next/link";
import { Plus, TrendingUp, Users, BedDouble, Calendar, CreditCard } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Overview of your properties for today
        </p>
      </div>

      {!hasProperties && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="font-medium text-orange-800">
            Welcome to HostOps! Get started by adding your first property.
          </p>
          <Link
            href="/dashboard/properties"
            className="mt-3 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Add Property
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Properties"
          value={String(data.totalProperties)}
          subtext="Active properties"
          accent="orange"
        />
        <StatCard
          label="Total Beds"
          value={String(data.totalBeds)}
          subtext="Across all properties"
          accent="blue"
        />
        <StatCard
          label="Available Beds"
          value={String(data.availableBeds)}
          subtext="Ready for booking today"
          accent="emerald"
        />
        <StatCard
          label="Occupied Beds"
          value={String(data.occupiedBeds)}
          subtext={`${data.occupancyRate}% occupancy rate`}
          accent="red"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Occupancy Rate"
          value={`${data.occupancyRate}%`}
          subtext={`${data.occupiedBeds} of ${data.totalBeds} beds occupied`}
          accent="orange"
        />
        <StatCard
          label="Revenue Today"
          value={formatINR(data.revenueToday)}
          subtext="From check-ins today"
          accent="green"
        />
        <StatCard
          label="Revenue This Month"
          value={formatINR(data.revenueMonth)}
          subtext="Month to date"
          accent="blue"
        />
        <StatCard
          label="Check-ins Today"
          value={String(data.checkinsToday)}
          subtext={`${data.checkoutsToday} check-outs today`}
          accent="purple"
        />
      </div>

      {/* Quick Actions */}
      {hasProperties && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/bookings/new"
              className="btn-primary flex items-center gap-2"
            >
              <Calendar size={18} />
              Add Booking
            </Link>
            <Link
              href="/dashboard/rooms/new"
              className="btn-secondary flex items-center gap-2"
            >
              <BedDouble size={18} />
              Add Room
            </Link>
            <Link
              href="/dashboard/properties/new"
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              Add Property
            </Link>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View All
          </Link>
        </div>
        {data.recentBookings.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            No bookings yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-6 py-3 font-medium">Booking Code</th>
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Check-in</th>
                  <th className="px-6 py-3 font-medium">Check-out</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-6 py-3 font-medium text-orange-600">
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
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-blue-50 text-blue-700"
                            : booking.status === "checked_in"
                            ? "bg-emerald-50 text-emerald-700"
                            : booking.status === "checked_out"
                            ? "bg-slate-50 text-slate-700"
                            : booking.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s Check-ins
          </h2>
        </div>
        {data.todaysCheckins.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            No check-ins scheduled for today.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Check-in</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todaysCheckins.map((checkin) => (
                  <tr
                    key={checkin.id}
                    className="border-b border-slate-50 last:border-0"
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
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s Check-outs
          </h2>
        </div>
        {data.todaysCheckouts.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            No check-outs scheduled for today.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Check-out</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todaysCheckouts.map((checkout) => (
                  <tr
                    key={checkout.id}
                    className="border-b border-slate-50 last:border-0"
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
                      <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Properties
            </h2>
            <Link
              href="/dashboard/properties"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.properties.map((property) => (
              <div
                key={property.id}
                className="rounded-lg border border-slate-100 p-4 hover:border-orange-200 transition-colors"
              >
                <p className="font-medium text-slate-900">{property.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {capitalize(property.type)} · {property.city},{" "}
                  {property.state}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {property.total_beds} beds
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
