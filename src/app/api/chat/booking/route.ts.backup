import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, name, phone, checkin, checkout, guests, room, amount, idtype, idnumber, utr, sender, paydate } = body;
    
    console.log('BOOKING RECEIVED:', JSON.stringify(body));
    
    const sql = neon(process.env.DATABASE_URL!);
    const code = 'CB' + Date.now().toString().slice(-8);

    const rooms = await sql`SELECT id FROM rooms WHERE property_id = ${propertyId} AND name ILIKE ${room || '%'} LIMIT 1`;
    const roomId = rooms[0]?.id || null;

    await sql`
      INSERT INTO bookings (
        booking_code, property_id, room_id,
        guest_name, guest_phone,
        check_in, check_out, number_of_guests,
        amount, final_amount,
        booking_source, status, payment_status
      ) VALUES (
        ${code}, ${propertyId}, ${roomId},
        ${name || 'Guest'}, ${phone || ''},
        ${checkin}, ${checkout}, ${parseInt(guests) || 1},
        ${parseFloat(amount) || 0}, ${parseFloat(amount) || 0},
        'bot', 'pending', 'pending'
      )
    `;

    const saved = await sql`SELECT id FROM bookings WHERE booking_code = ${code}`;
    const bookingId = saved[0]?.id;

    if (bookingId && (utr || idtype)) {
      await sql`
        UPDATE bookings SET
          id_proof_type = ${idtype || null},
          id_proof_number = ${idnumber || null},
          utr_number = ${utr || null},
          payment_sender_name = ${sender || null},
          payment_date = ${paydate || null}
        WHERE id = ${bookingId}
      `;
    }

    console.log('BOOKING SAVED:', code, 'ID:', bookingId);
    return NextResponse.json({ success: true, booking_code: code });
  } catch (error: any) {
    console.error('BOOKING ERROR:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Booking failed' }, { status: 500 });
  }
}
