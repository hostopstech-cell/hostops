"use client";

import { useEffect, useState } from "react";
import { Building2, BedDouble, Users, TrendingUp, Calendar, X, ChevronRight } from "lucide-react";
import { formatINR, formatDate, capitalize } from "@/lib/format";
import SlideOverPanel from "@/components/SlideOverPanel";
import Link from "next/link";
import { Plus } from "lucide-react";

interface DashboardData {
  totalProperties: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  revenueToday: number;
  revenueMonth: number;
  checkinsToday: number;
  checkoutsToday: number;
  todaysCheckins: any[];
  todaysCheckouts: any[];
  recentBookings: any[];
  properties: any[];
  bedsData: any[];
  propertyOccupancy: any[];
  monthlyRevenueBreakdown: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
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
      <div className="gradient-navy rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
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

      {/* 6 Smart Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* CARD 1: PROPERTIES */}
        <div
          className="stat-card border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('properties')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Building2 size={24} className="text-orange-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.totalProperties}</p>
          <p className="mt-1 text-sm text-slate-500">Active Properties</p>
        </div>

        {/* CARD 2: BEDS AVAILABLE */}
        <div
          className="stat-card border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('beds')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BedDouble size={24} className="text-blue-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.availableBeds}</p>
          <p className="mt-1 text-sm text-slate-500">Beds Available</p>
        </div>

        {/* CARD 3: OCCUPANCY */}
        <div
          className="stat-card border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('occupancy')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users size={24} className="text-emerald-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.occupancyRate}%</p>
          <p className="mt-1 text-sm text-slate-500">Overall Occupancy</p>
        </div>

        {/* CARD 4: TODAY'S REVENUE */}
        <div
          className="stat-card border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('todayRevenue')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatINR(data.revenueToday)}</p>
          <p className="mt-1 text-sm text-slate-500">Today's Revenue</p>
        </div>

        {/* CARD 5: TODAY'S CHECK-INS & CHECK-OUTS */}
        <div
          className="stat-card border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('checkins')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Calendar size={24} className="text-orange-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {data.checkinsToday} <span className="text-lg text-slate-400">|</span> {data.checkoutsToday}
          </p>
          <p className="mt-1 text-sm text-slate-500">Check-ins | Check-outs</p>
        </div>

        {/* CARD 6: THIS MONTH REVENUE */}
        <div
          className="stat-card border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => setActivePanel('monthRevenue')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatINR(data.revenueMonth)}</p>
          <p className="mt-1 text-sm text-slate-500">This Month Revenue</p>
        </div>
      </div>

      {/* Slide-over Panels */}
      <SlideOverPanel
        isOpen={activePanel === 'properties'}
        onClose={() => setActivePanel(null)}
        title="Properties Details"
      >
        <div className="space-y-4">
          {data.properties.map((property) => {
            const propOccupancy = data.propertyOccupancy.find((p: any) => p.id === property.id);
            const occupied = propOccupancy?.occupied_beds || 0;
            const available = property.total_beds - occupied;
            const occupancyRate = property.total_beds > 0 ? Math.round((occupied / property.total_beds) * 100) : 0;
            
            return (
              <div key={property.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{property.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    occupancyRate > 80 ? 'bg-red-100 text-red-700' :
                    occupancyRate > 50 ? 'bg-orange-100 text-orange-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {occupancyRate}% Occupied
                  </span>
                </div>
                <p className="text-sm text-slate-600">{property.city}, {property.state}</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="font-bold text-slate-900">{property.total_beds}</p>
                    <p className="text-xs text-slate-500">Total Beds</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <p className="font-bold text-emerald-700">{available}</p>
                    <p className="text-xs text-slate-500">Available</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <p className="font-bold text-orange-700">{occupied}</p>
                    <p className="text-xs text-slate-500">Booked</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SlideOverPanel>

      <SlideOverPanel
        isOpen={activePanel === 'beds'}
        onClose={() => setActivePanel(null)}
        title="Available Beds"
      >
        <div className="space-y-4">
          {data.bedsData.filter((bed: any) => bed.status === 'available').length === 0 ? (
            <p className="text-slate-500 text-center py-8">No available beds</p>
          ) : (
            data.bedsData
              .filter((bed: any) => bed.status === 'available')
              .reduce((acc: any[], bed: any) => {
                const prop = acc.find((p: any) => p.property_name === bed.property_name);
                if (!prop) {
                  acc.push({
                    property_name: bed.property_name,
                    beds: [{
                      bed_number: bed.bed_number,
                      room_name: bed.room_name,
                      room_type: bed.room_type,
                    }],
                  });
                } else {
                  prop.beds.push({
                    bed_number: bed.bed_number,
                    room_name: bed.room_name,
                    room_type: bed.room_type,
                  });
                }
                return acc;
              }, [])
              .map((group: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-3">{group.property_name}</h3>
                  <div className="space-y-2">
                    {group.beds.map((bed: any, bedIdx: number) => (
                      <div key={bedIdx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">Bed {bed.bed_number}</p>
                          <p className="text-xs text-slate-500">{bed.room_name}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          {capitalize(bed.room_type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </SlideOverPanel>

      <SlideOverPanel
        isOpen={activePanel === 'occupancy'}
        onClose={() => setActivePanel(null)}
        title="Occupancy Breakdown"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-slate-900">Overall Occupancy</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{data.occupancyRate}%</p>
            <p className="text-sm text-slate-600">{data.occupiedBeds} of {data.totalBeds} beds occupied</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Property-wise Occupancy</h4>
            {data.propertyOccupancy.map((prop: any) => {
              const occupancyRate = prop.total_beds > 0 ? Math.round((prop.occupied_beds / prop.total_beds) * 100) : 0;
              return (
                <div key={prop.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{prop.name}</span>
                    <span className="text-sm font-bold text-slate-700">{occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occupancyRate > 80 ? 'bg-red-500' :
                        occupancyRate > 50 ? 'bg-orange-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{prop.occupied_beds} of {prop.total_beds} beds</p>
                </div>
              );
            })}
          </div>
        </div>
      </SlideOverPanel>

      <SlideOverPanel
        isOpen={activePanel === 'todayRevenue'}
        onClose={() => setActivePanel(null)}
        title="Today's Revenue Details"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-slate-900">Total Revenue Today</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{formatINR(data.revenueToday)}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Today's Bookings</h4>
            {data.recentBookings
              .filter((b: any) => b.check_in === new Date().toISOString().split('T')[0])
              .length === 0 ? (
              <p className="text-slate-500">No bookings today</p>
            ) : (
              <div className="space-y-2">
                {data.recentBookings
                  .filter((b: any) => b.check_in === new Date().toISOString().split('T')[0])
                  .map((booking: any) => (
                    <div key={booking.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.guest_name}</p>
                          <p className="text-xs text-slate-500">{booking.property_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatINR(booking.final_amount)}</p>
                          <p className="text-xs text-slate-500 capitalize">{booking.booking_source?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </SlideOverPanel>

      <SlideOverPanel
        isOpen={activePanel === 'checkins'}
        onClose={() => setActivePanel(null)}
        title="Today's Check-ins & Check-outs"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Check-ins ({data.checkinsToday})</h3>
            {data.todaysCheckins.length === 0 ? (
              <p className="text-slate-500">No check-ins today</p>
            ) : (
              <div className="space-y-2">
                {data.todaysCheckins.map((checkin) => (
                  <div key={checkin.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{checkin.guest_name}</p>
                        <p className="text-xs text-slate-500">{checkin.property_name}</p>
                        <p className="text-xs text-slate-400">Room: {checkin.room_id || 'N/A'} | Bed: {checkin.bed_id || 'N/A'}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold capitalize">
                        {checkin.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Check-outs ({data.checkoutsToday})</h3>
            {data.todaysCheckouts.length === 0 ? (
              <p className="text-slate-500">No check-outs today</p>
            ) : (
              <div className="space-y-2">
                {data.todaysCheckouts.map((checkout) => (
                  <div key={checkout.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{checkout.guest_name}</p>
                        <p className="text-xs text-slate-500">{checkout.property_name}</p>
                        <p className="text-xs text-slate-400">Room: {checkout.room_id || 'N/A'} | Bed: {checkout.bed_id || 'N/A'}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold capitalize">
                        {checkout.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlideOverPanel>

      <SlideOverPanel
        isOpen={activePanel === 'monthRevenue'}
        onClose={() => setActivePanel(null)}
        title="This Month Revenue Details"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-slate-900">Total Revenue This Month</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{formatINR(data.revenueMonth)}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Day-wise Breakdown</h4>
            {data.monthlyRevenueBreakdown.length === 0 ? (
              <p className="text-slate-500">No revenue this month</p>
            ) : (
              <div className="space-y-2">
                {data.monthlyRevenueBreakdown.map((day: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-900">{formatDate(day.date)}</span>
                    <span className="font-bold text-slate-900">{formatINR(day.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlideOverPanel>
    </div>
  );
}
