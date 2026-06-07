import { sql } from "@/lib/db";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(
  ownerId: number
): Promise<DashboardStats> {
  const properties = await sql`
    SELECT id, owner_id, name, type, address, city, state, total_beds, created_at
    FROM properties
    WHERE owner_id = ${ownerId}
    ORDER BY name ASC
  `;

  const totalBedsResult = await sql`
    SELECT COALESCE(SUM(total_beds), 0)::int AS total_beds
    FROM properties
    WHERE owner_id = ${ownerId}
  `;
  const totalBeds = totalBedsResult[0]?.total_beds ?? 0;

  const today = new Date().toISOString().split("T")[0];
  const monthStart = `${today.slice(0, 8)}01`;

  const occupiedResult = await sql`
    SELECT COALESCE(SUM(b.number_of_guests), 0)::int AS occupied_beds
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.status IN ('confirmed', 'checked_in')
      AND b.check_in <= ${today}::date
      AND b.check_out > ${today}::date
  `;
  const occupiedBeds = occupiedResult[0]?.occupied_beds ?? 0;

  const revenueTodayResult = await sql`
    SELECT COALESCE(SUM(b.final_amount), 0)::float AS revenue
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_in = ${today}::date
      AND b.status != 'cancelled'
  `;
  const revenueToday = revenueTodayResult[0]?.revenue ?? 0;

  const revenueMonthResult = await sql`
    SELECT COALESCE(SUM(b.final_amount), 0)::float AS revenue
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_in >= ${monthStart}::date
      AND b.check_in <= ${today}::date
      AND b.status != 'cancelled'
  `;
  const revenueMonth = revenueMonthResult[0]?.revenue ?? 0;

  const checkinsTodayResult = await sql`
    SELECT COUNT(*)::int AS count
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_in = ${today}::date
      AND b.status != 'cancelled'
  `;
  const checkinsToday = checkinsTodayResult[0]?.count ?? 0;

  const checkoutsTodayResult = await sql`
    SELECT COUNT(*)::int AS count
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_out = ${today}::date
      AND b.status != 'cancelled'
  `;
  const checkoutsToday = checkoutsTodayResult[0]?.count ?? 0;

  const todaysCheckins = await sql`
    SELECT
      b.id,
      b.guest_name,
      b.check_in,
      b.status,
      p.name AS property_name
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_in = ${today}::date
      AND b.status != 'cancelled'
    ORDER BY b.created_at ASC
  `;

  const todaysCheckouts = await sql`
    SELECT
      b.id,
      b.guest_name,
      b.check_out,
      b.status,
      p.name AS property_name
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_out = ${today}::date
      AND b.status != 'cancelled'
    ORDER BY b.check_out ASC
  `;

  const recentBookings = await sql`
    SELECT
      b.id,
      b.booking_code,
      b.guest_name,
      b.check_in,
      b.check_out,
      b.status,
      p.name AS property_name
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
    ORDER BY b.created_at DESC
    LIMIT 10
  `;

  const availableBeds = Math.max(totalBeds - occupiedBeds, 0);
  const occupancyRate =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return {
    totalProperties: properties.length,
    totalBeds,
    occupiedBeds,
    availableBeds,
    occupancyRate,
    revenueToday,
    revenueMonth,
    checkinsToday,
    checkoutsToday,
    todaysCheckins: todaysCheckins as DashboardStats["todaysCheckins"],
    todaysCheckouts: todaysCheckouts as DashboardStats["todaysCheckouts"],
    recentBookings: recentBookings as DashboardStats["recentBookings"],
    properties: properties as DashboardStats["properties"],
  };
}
