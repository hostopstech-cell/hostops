import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const props = await pool.query('SELECT COUNT(*) as count FROM properties').catch(() => ({ rows: [{ count: 0 }] }))
    const rooms = await pool.query('SELECT SUM(number_of_beds) as total FROM rooms').catch(() => ({ rows: [{ total: 0 }] }))
    const bookings = await pool.query('SELECT * FROM bookings').catch(() => ({ rows: [] }))

    const totalBeds = Number(rooms.rows[0]?.total) || 0
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    const todayCheckins = bookings.rows.filter((b: any) => b.check_in_date?.toString().startsWith(today)).length
    const todayCheckouts = bookings.rows.filter((b: any) => b.check_out_date?.toString().startsWith(today)).length
    const todayRevenue = bookings.rows.filter((b: any) => b.check_in_date?.toString().startsWith(today)).reduce((s: number, b: any) => s + Number(b.amount || 0), 0)
    const monthRevenue = bookings.rows.filter((b: any) => b.check_in_date?.toString().startsWith(thisMonth)).reduce((s: number, b: any) => s + Number(b.amount || 0), 0)

    return NextResponse.json({
      totalProperties: Number(props.rows[0]?.count) || 0,
      totalBeds,
      availableBeds: totalBeds,
      occupancyRate: 0,
      todayRevenue,
      monthRevenue,
      todayCheckins,
      todayCheckouts
    })
  } catch (e: any) {
    return NextResponse.json({ totalProperties: 0, totalBeds: 0, availableBeds: 0, occupancyRate: 0, todayRevenue: 0, monthRevenue: 0, todayCheckins: 0, todayCheckouts: 0 })
  }
}
