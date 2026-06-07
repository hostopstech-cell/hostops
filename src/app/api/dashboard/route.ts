import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const properties = await pool.query('SELECT * FROM properties WHERE status = $1', ['active']).catch(() => ({ rows: [] }))
    const beds = await pool.query('SELECT * FROM beds').catch(() => ({ rows: [] }))
    const bookings = await pool.query('SELECT * FROM bookings').catch(() => ({ rows: [] }))
    const guests = await pool.query('SELECT * FROM guests').catch(() => ({ rows: [] }))

    const totalBeds = beds.rows.length || 0
    const occupiedBeds = beds.rows.filter((b: any) => b.status === 'booked').length || 0
    const availableBeds = totalBeds - occupiedBeds
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    const today = new Date().toISOString().split('T')[0]
    const todayRevenue = bookings.rows
      .filter((b: any) => b.check_in_date?.toString().startsWith(today))
      .reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0)

    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthRevenue = bookings.rows
      .filter((b: any) => b.check_in_date?.toString().startsWith(thisMonth))
      .reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0)

    const todaysCheckins = bookings.rows.filter((b: any) => b.check_in_date?.toString().startsWith(today)) || []
    const todaysCheckouts = bookings.rows.filter((b: any) => b.check_out_date?.toString().startsWith(today)) || []

    return NextResponse.json({
      properties: properties.rows || [],
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      todayRevenue,
      monthRevenue,
      todaysCheckins,
      todaysCheckouts,
      recentBookings: bookings.rows.slice(0, 5) || [],
      bedsData: beds.rows || [],
      propertyOccupancy: [],
      monthlyRevenueBreakdown: []
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({
      properties: [],
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      occupancyRate: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      todaysCheckins: [],
      todaysCheckouts: [],
      recentBookings: [],
      bedsData: [],
      propertyOccupancy: [],
      monthlyRevenueBreakdown: []
    })
  }
}
