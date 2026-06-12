import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const checkin = searchParams.get('checkin') || new Date().toISOString().split('T')[0];
    const checkout = searchParams.get('checkout') || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const props = await sql`SELECT * FROM properties WHERE id = ${params.propertyId} AND status = 'active' LIMIT 1`;
    if (!props.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    if (!props[0].bot_enabled) return NextResponse.json({ error: 'Bot not enabled' }, { status: 403 });
    const p = props[0];

    const rooms = await sql`
      SELECT id, name, type, price_per_night, number_of_beds, status
      FROM rooms WHERE property_id = ${params.propertyId} AND status = 'available'
    `;

    // For each room, calculate available beds/slots for the given dates
    const roomsWithAvailability = await Promise.all(rooms.map(async (r: any) => {
      const isDorm = r.type === 'dorm' || r.type === 'mixed_dorm';
      if (isDorm) {
        const booked = await sql`
          SELECT COALESCE(SUM(number_of_guests), 0)::int AS booked FROM bookings
          WHERE room_id = ${r.id} AND status NOT IN ('cancelled','checked_out')
          AND check_in < ${checkout} AND check_out > ${checkin}
        `;
        const available = Number(r.number_of_beds) - Number(booked[0].booked);
        return { ...r, available_beds: Math.max(0, available), is_available: available > 0 };
      } else {
        const overlap = await sql`
          SELECT COUNT(*)::int AS cnt FROM bookings
          WHERE room_id = ${r.id} AND status NOT IN ('cancelled','checked_out')
          AND check_in < ${checkout} AND check_out > ${checkin}
        `;
        const available = Number(overlap[0].cnt) === 0;
        return { ...r, available_beds: available ? 1 : 0, is_available: available };
      }
    }));

    return NextResponse.json({
      property: {
        name: p.name, city: p.city, type: p.type,
        contact: p.contact || 'N/A',
        upi_id: p.upi_id || null,
        payment_name: p.payment_name || p.name,
        check_in_time: p.check_in_time || '14:00',
        check_out_time: p.check_out_time || '11:00',
      },
      rooms: roomsWithAvailability,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  return NextResponse.json({ reply: 'Please use the booking form.', property: null });
}
