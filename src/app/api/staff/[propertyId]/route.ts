import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function verifyToken(propertyId: string, token: string): boolean {
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
    return decoded.startsWith(`${propertyId}:staff:`)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const { propertyId } = params
  const token = req.nextUrl.searchParams.get('token') || ''

  if (!verifyToken(propertyId, token)) {
    return NextResponse.json({ error: 'Invalid or expired access link' }, { status: 401 })
  }

  try {
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const cutoff = tenDaysAgo.toISOString().split('T')[0]

    const propResult = await sql`
      SELECT id, name, type, address, city, state, total_beds, check_in_time, check_out_time, status
      FROM properties WHERE id = ${propertyId}
    `
    if (!propResult[0]) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const bookingsResult = await sql`
      SELECT b.id, b.guest_name, b.guest_phone, b.check_in, b.check_out,
             b.number_of_guests, b.status, b.payment_status,
             b.final_amount, b.amount, b.booking_source, b.created_at,
             b.utr_number, b.payment_sender_name, b.payment_date,
             b.payment_method, b.booking_code,
             r.name as room_name
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.property_id = ${propertyId}
        AND b.check_in >= ${cutoff}
      ORDER BY b.check_in DESC
      LIMIT 100
    `

    const roomsResult = await sql`
      SELECT id, name, price_per_night
      FROM rooms WHERE property_id = ${propertyId} AND status = 'available'
    `

    return NextResponse.json({
      property: propResult[0],
      bookings: bookingsResult,
      rooms: roomsResult,
    })
  } catch (err) {
    console.error('Staff API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const { propertyId } = params
  const token = req.nextUrl.searchParams.get('token') || ''

  if (!verifyToken(propertyId, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { guestName, guestPhone, checkIn, checkOut, numberOfGuests, amount, roomId, paymentStatus, paymentMethod, notes } = body

    if (!guestName || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: 'Guest name, dates and amount are required' }, { status: 400 })
    }

    const bookingCode = `ST${Date.now()}`
    const finalAmount = Number(amount)

    const result = await sql`
      INSERT INTO bookings (
        property_id, room_id, guest_name, guest_phone,
        check_in, check_out, number_of_guests,
        amount, discount, final_amount,
        payment_method, payment_status, booking_source,
        notes, booking_code, status
      ) VALUES (
        ${propertyId}, ${roomId || null}, ${guestName.trim()}, ${guestPhone?.trim() || null},
        ${checkIn}, ${checkOut}, ${Number(numberOfGuests) || 1},
        ${finalAmount}, 0, ${finalAmount},
        ${paymentMethod || 'cash'}, ${paymentStatus || 'pending'}, 'walk_in',
        ${notes?.trim() || null}, ${bookingCode}, 'confirmed'
      )
      RETURNING id, booking_code, guest_name, check_in, check_out, final_amount, status
    `

    return NextResponse.json({ booking: result[0] }, { status: 201 })
  } catch (err) {
    console.error('Staff booking create error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
