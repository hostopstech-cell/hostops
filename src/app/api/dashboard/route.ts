import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ownerId = owner.ownerId;
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const [propsRes, bookingsRes] = await Promise.all([
      sql`SELECT id, name, total_beds FROM properties WHERE owner_id = ${ownerId}`,
      sql`
        SELECT b.* FROM bookings b
        JOIN properties p ON p.id = b.property_id
        WHERE p.owner_id = ${ownerId}
      `
    ]);

    const props = propsRes;
    const bookings = bookingsRes;

    const totalBeds = props.reduce((sum: number, p: any) => sum + (Number(p.total_beds) || 0), 0);
    const soldBeds = bookings.filter((b: any) => ['confirmed','checked_in'].includes(b.status)).length;
    const availableBeds = Math.max(0, totalBeds - soldBeds);
    const occupancyRate = totalBeds > 0 ? Math.round(soldBeds / totalBeds * 100) : 0;

    const todayCheckins = bookings.filter((b: any) => b.check_in?.toString().startsWith(today)).length;
    const todayCheckouts = bookings.filter((b: any) => b.check_out?.toString().startsWith(today)).length;

    const todayRevenue = bookings
      .filter((b: any) => b.check_in?.toString().startsWith(today))
      .reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);

    const monthRevenue = bookings
      .filter((b: any) => b.check_in?.toString().startsWith(thisMonth))
      .reduce((s: number, b: any) => s + Number(b.final_amount || b.amount || 0), 0);

    const recentBookings = await sql`
      SELECT b.id, b.guest_name, b.guest_phone, b.check_in, b.check_out,
             b.amount, b.final_amount, b.status, b.payment_status, b.booking_code,
             p.name as property_name
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE p.owner_id = ${ownerId}
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

    const propertyPerformance = await sql`
      SELECT p.name, p.id,
             COUNT(b.id) as total_bookings,
             COALESCE(SUM(b.final_amount), 0) as total_revenue
      FROM properties p
      LEFT JOIN bookings b ON b.property_id = p.id AND b.payment_status = 'paid'
      WHERE p.owner_id = ${ownerId}
      GROUP BY p.id, p.name
    `;

    return NextResponse.json({
      totalProperties: props.length,
      totalBeds,
      soldBeds,
      availableBeds,
      occupancyRate,
      todayRevenue,
      monthRevenue,
      todayCheckins,
      todayCheckouts,
      recentBookings,
      propertyPerformance,
    });
  } catch (e: any) {
    console.error("Dashboard error:", e);
    return NextResponse.json({ totalProperties: 0, totalBeds: 0, soldBeds: 0, availableBeds: 0, occupancyRate: 0, todayRevenue: 0, monthRevenue: 0, todayCheckins: 0, todayCheckouts: 0, recentBookings: [], propertyPerformance: [] });
  }
}
