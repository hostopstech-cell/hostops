import { NextResponse } from 'next/server'
import { Pool } from 'pg'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('property_id')
    let result
    if (propertyId) {
      result = await pool.query('SELECT * FROM rooms WHERE property_id = $1 ORDER BY id', [propertyId])
    } else {
      result = await pool.query('SELECT * FROM rooms ORDER BY id')
    }
    return NextResponse.json({ rooms: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, name, type, capacity, pricePerNight, status } = body
    const result = await pool.query(
      'INSERT INTO rooms (property_id, name, type, number_of_beds, price_per_night, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [Number(propertyId), name, type, Number(capacity), Number(pricePerNight), status || 'available']
    )
    return NextResponse.json({ room: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
