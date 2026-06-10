import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const { propertyId, name, phone, checkin, checkout, guests, room, amount, idtype, idnumber, utr, sender, paydate } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);

    const rooms = await sql`SELECT id FROM rooms WHERE property_id = ${propertyId} AND name ILIKE ${room || ''} LIMIT 1`;
    const roomId = rooms[0]?.id || null;
    const code = 'CB' + Date.now().toString().slice(-8);

    const booking = await sql`
      INSERT INTO bookings (
        booking_code, property_id, room_id, guest_name, guest_phone,
        check_in, check_out, number_of_guests, amount, final_amount,
        booking_source, status, payment_status,
        id_proof_type, id_proof_number,
        utr_number, payment_sender_name, payment_date
      )
      VALUES (
        ${code}, ${propertyId}, ${roomId}, ${name}, ${phone},
        ${checkin}, ${checkout}, ${guests}, ${amount}, ${amount},
        'bot', 'pending', 'pending',
        ${idtype || null}, ${idnumber || null},
        ${utr || null}, ${sender || null}, ${paydate || null}
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, booking_code: code });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
