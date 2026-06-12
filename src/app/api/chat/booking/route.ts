import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, name, phone, checkin, checkout, guests, room, amount, idtype, idnumber, utr, sender, paydate, guestsData } = body;
    console.log('BOOKING RECEIVED:', JSON.stringify(body));
    const sql = neon(process.env.DATABASE_URL!);
    const code = 'CB' + Date.now().toString().slice(-8);

    // Find room
    const rooms = await sql`SELECT id, type, number_of_beds FROM rooms WHERE property_id = ${propertyId} AND name ILIKE ${room || '%'} AND status = 'available' LIMIT 1`;
    const roomRow = rooms[0] || null;
    const roomId = roomRow?.id || null;

    // Availability check (date-based only, no status change)
    if (roomRow && roomId) {
      const requestedGuests = parseInt(guests) || 1;
      if (roomRow.type === 'dorm' || roomRow.type === 'mixed_dorm') {
        const bookedRows = await sql`
          SELECT COALESCE(SUM(number_of_guests), 0)::int AS booked FROM bookings
          WHERE room_id = ${roomId} AND status NOT IN ('cancelled','checked_out')
          AND check_in < ${checkout} AND check_out > ${checkin}
        `;
        const available = Number(roomRow.number_of_beds) - Number(bookedRows[0].booked);
        if (requestedGuests > available) {
          return NextResponse.json({ error: `Only ${available} bed(s) available for these dates.` }, { status: 409 });
        }
      } else {
        const overlap = await sql`
          SELECT COUNT(*)::int AS cnt FROM bookings
          WHERE room_id = ${roomId} AND status NOT IN ('cancelled','checked_out')
          AND check_in < ${checkout} AND check_out > ${checkin}
        `;
        if (Number(overlap[0].cnt) > 0) {
          return NextResponse.json({ error: 'Room already booked for these dates.' }, { status: 409 });
        }
      }
    }

    // Build guests JSON
    let guestsArray = null;
    if (guestsData) {
      const arr = Array.isArray(guestsData) ? guestsData : (guestsData.guests || []);
      if (arr.length > 0) guestsArray = JSON.stringify(arr.map((g: any) => ({ name: g.name||'', phone: g.phone||'', idProofType: g.idtype||g.idProofType||null, idProofNumber: g.idnumber||g.idProofNumber||null })));
    }
    if (!guestsArray) guestsArray = JSON.stringify([{ name: name||'Guest', phone: phone||'', idProofType: idtype||null, idProofNumber: idnumber||null }]);

    await sql`
      INSERT INTO bookings (booking_code, property_id, room_id, guest_name, guest_phone, check_in, check_out, number_of_guests, amount, final_amount, booking_source, status, payment_status, id_proof_type, id_proof_number, utr_number, payment_sender_name, payment_date, guests_data)
      VALUES (${code}, ${propertyId}, ${roomId}, ${name||'Guest'}, ${phone||''}, ${checkin}, ${checkout}, ${parseInt(guests)||1}, ${parseFloat(amount)||0}, ${parseFloat(amount)||0}, 'direct', 'confirmed', 'pending', ${idtype||null}, ${idnumber||null}, ${utr||null}, ${sender||null}, ${paydate||null}, ${guestsArray})
    `;

    const saved = await sql`SELECT id FROM bookings WHERE booking_code = ${code}`;
    console.log('BOOKING SAVED:', code, 'ID:', saved[0]?.id);
    return NextResponse.json({ success: true, booking_code: code, bookingId: saved[0]?.id });
  } catch (error: any) {
    console.error('BOOKING ERROR:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Booking failed' }, { status: 500 });
  }
}
