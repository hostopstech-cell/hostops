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

    // Calculate availability per individual room
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
        const isAvailable = Number(overlap[0].cnt) === 0;
        return { ...r, available_beds: isAvailable ? 1 : 0, is_available: isAvailable };
      }
    }));

    // Group rooms by type + price_per_night
    // For dorms: sum available_beds across all rooms of same type+price
    // For private: count how many rooms are available
    const groupMap = new Map<string, any>();

    for (const r of roomsWithAvailability) {
      const isDorm = r.type === 'dorm' || r.type === 'mixed_dorm';
      const key = `${r.type}__${r.price_per_night}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          id: r.id, // representative id (not used for booking)
          type: r.type,
          price_per_night: r.price_per_night,
          number_of_beds: 0,
          total_rooms: 0,
          available_count: 0, // available rooms (private) or available beds (dorm)
          total_available_beds: 0,
          is_available: false,
          // store individual room ids for booking assignment
          available_room_ids: [],
        });
      }

      const g = groupMap.get(key);
      g.total_rooms += 1;
      g.number_of_beds += Number(r.number_of_beds);

      if (isDorm) {
        g.total_available_beds += r.available_beds;
        if (r.available_beds > 0) {
          g.available_count += r.available_beds;
          g.is_available = true;
          g.available_room_ids.push({ id: r.id, available_beds: r.available_beds });
        }
      } else {
        if (r.is_available) {
          g.available_count += 1;
          g.is_available = true;
          g.available_room_ids.push({ id: r.id });
        }
      }
    }

    // Convert map to array with clean display names
    const typeLabels: Record<string, string> = {
      private: 'Private Room',
      private_room: 'Private Room',
      dorm: 'Dorm Bed',
      mixed_dorm: 'Mixed Dorm',
      suite: 'Suite',
      deluxe: 'Deluxe Room',
      standard: 'Standard Room',
      villa: 'Villa',
      apartment: 'Apartment',
    };

    const groupedRooms = Array.from(groupMap.values()).map(g => {
      const isDorm = g.type === 'dorm' || g.type === 'mixed_dorm';
      const label = typeLabels[g.type] || g.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      return {
        // Use a composite key as id for frontend selection
        id: `group__${g.type}__${g.price_per_night}`,
        name: label,
        type: g.type,
        price_per_night: g.price_per_night,
        number_of_beds: isDorm ? g.total_available_beds : g.total_rooms,
        available_beds: isDorm ? g.total_available_beds : g.available_count,
        available_count: g.available_count,
        total_rooms: g.total_rooms,
        is_available: g.is_available,
        available_room_ids: g.available_room_ids,
      };
    });

    return NextResponse.json({
      property: {
        name: p.name, city: p.city, type: p.type,
        contact: p.contact || 'N/A',
        upi_id: p.upi_id || null,
        payment_name: p.payment_name || p.name,
        check_in_time: p.check_in_time || '14:00',
        check_out_time: p.check_out_time || '11:00',
      },
      rooms: groupedRooms,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  return NextResponse.json({ reply: 'Please use the booking form.', property: null });
}
