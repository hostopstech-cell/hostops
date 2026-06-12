import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET — fetch property + rooms for form UI
export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const props = await sql`SELECT * FROM properties WHERE id = ${params.propertyId} AND status = 'active' LIMIT 1`;
    if (!props.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    if (!props[0].bot_enabled) return NextResponse.json({ error: 'Bot not enabled' }, { status: 403 });
    const p = props[0];

    const rooms = await sql`
      SELECT id, name, type, price_per_night, number_of_beds
      FROM rooms WHERE property_id = ${params.propertyId} AND status = 'available'
    `;

    return NextResponse.json({
      property: {
        name: p.name, city: p.city, type: p.type,
        contact: p.contact || 'N/A',
        upi_id: p.upi_id || null,
        payment_name: p.payment_name || p.name,
        check_in_time: p.check_in_time || '14:00',
        check_out_time: p.check_out_time || '11:00',
      },
      rooms,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST — kept for backward compat (not used by new UI)
export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  return NextResponse.json({ reply: 'Please use the booking form.', property: null });
}
