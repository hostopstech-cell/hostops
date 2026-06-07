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
    SELECT COALESCE(SUM(p.total_beds), 0)::int AS total_beds
    FROM properties p
    WHERE p.owner_id = ${ownerId}
  `;
  const totalBeds = totalBedsResult[0]?.total_beds ?? 0;

  const today = new Date().toISOString().split("T")[0];
  const monthStart = `${today.slice(0, 8)}01`;

  const occupiedResult = await sql`
    SELECT COALESCE(COUNT(b.id), 0)::int AS occupied_beds
    FROM beds b
    JOIN rooms r ON r.id = b.room_id
    JOIN properties p ON p.id = r.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.status = 'occupied'
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
      b.room_id,
      b.bed_id,
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
      b.room_id,
      b.bed_id,
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
      b.final_amount,
      b.booking_source,
      p.name AS property_name
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
    ORDER BY b.created_at DESC
    LIMIT 10
  `;

  // Get beds data with room info
  const bedsData = await sql`
    SELECT
      b.id,
      b.bed_number,
      b.status,
      b.room_id,
      r.name AS room_name,
      r.type AS room_type,
      r.property_id,
      p.name AS property_name
    FROM beds b
    JOIN rooms r ON r.id = b.room_id
    JOIN properties p ON p.id = r.property_id
    WHERE p.owner_id = ${ownerId}
    ORDER BY p.name, r.name, b.bed_number
  `;

  // Get property-wise occupancy
  const propertyOccupancy = await sql`
    SELECT
      p.id,
      p.name,
      p.total_beds,
      COALESCE(SUM(b.number_of_guests), 0)::int AS occupied_beds
    FROM properties p
    LEFT JOIN bookings b ON b.property_id = p.id
      AND b.status IN ('confirmed', 'checked_in')
      AND b.check_in <= ${today}::date
      AND b.check_out > ${today}::date
    WHERE p.owner_id = ${ownerId}
    GROUP BY p.id, p.name, p.total_beds
    ORDER BY p.name
  `;

  // Get day-wise revenue for current month
  const monthlyRevenueBreakdown = await sql`
    SELECT
      b.check_in as date,
      COALESCE(SUM(b.final_amount), 0)::float AS revenue
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.owner_id = ${ownerId}
      AND b.check_in >= ${monthStart}::date
      AND b.check_in <= ${today}::date
      AND b.status != 'cancelled'
    GROUP BY b.check_in
    ORDER BY b.check_in ASC
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
    bedsData: bedsData as any[],
    propertyOccupancy: propertyOccupancy as any[],
    monthlyRevenueBreakdown: monthlyRevenueBreakdown as any[],
  };
}
