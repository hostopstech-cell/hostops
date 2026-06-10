import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const { propertyId, name, phone, checkin, checkout, guests, room, amount, utr, sender, paydate } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);

    const rooms = await sql`SELECT id FROM rooms WHERE property_id = ${propertyId} AND name ILIKE ${room} LIMIT 1`;
    const roomId = rooms[0]?.id || null;

    const code = 'CB' + Date.now().toString().slice(-8);

    await sql`
      INSERT INTO bookings (booking_code, property_id, room_id, guest_name, guest_phone, check_in, check_out, number_of_guests, amount, final_amount, booking_source, status, payment_status)
      VALUES (${code}, ${propertyId}, ${roomId}, ${name}, ${phone}, ${checkin}, ${checkout}, ${guests}, ${amount}, ${amount}, 'direct', 'pending', 'pending')
    `;

    if (utr) {
      const bookings2 = await sql`SELECT id FROM bookings WHERE booking_code=\${code}`;
      if (bookings2[0]) {
        await sql`UPDATE bookings SET utr_number=\${utr}, payment_sender_name=\${sender}, payment_date=\${paydate || new Date().toISOString().split('T')[0]} WHERE id=\${bookings2[0].id}`;
      }
    }
    return NextResponse.json({ success: true, booking_code: code });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
