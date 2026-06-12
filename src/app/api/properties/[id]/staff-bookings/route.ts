import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function verifyToken(request: Request, propertyId: number) {
  const token = request.headers.get("x-staff-token");
  const props = await sql`SELECT id, name, staff_token FROM properties WHERE id = ${propertyId}`;
  if (props.length === 0) return null;
  const property = props[0];
  if (!token || token !== property.staff_token) return null;
  return property;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = parseInt(params.id, 10);
    const property = await verifyToken(request, propertyId);
    if (!property) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await sql`
      SELECT b.id, b.booking_code, b.guest_name, b.guest_phone,
             b.check_in, b.check_out, b.amount, b.final_amount,
             b.payment_status, b.payment_method, b.status,
             b.utr_number, b.payment_sender_name, b.payment_date,
             b.number_of_guests, b.booking_source, b.created_at,
             b.guests_data, b.id_proof_type, b.id_proof_number,
             r.name as room_name
      FROM bookings b
      LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.property_id = ${propertyId}
        AND b.created_at >= ${sevenDaysAgo.toISOString()}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ bookings, propertyName: property.name });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = parseInt(params.id, 10);
    const property = await verifyToken(request, propertyId);
    if (!property) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      guestName, guestPhone, checkIn, checkOut, amount,
      paymentStatus, paymentMethod, utrNumber, paymentSenderName,
      numberOfGuests, status, bookingSource,
      idProofType, idProofNumber, additionalGuests
    } = body;

    if (!guestName?.trim()) return NextResponse.json({ error: "Guest name required" }, { status: 400 });
    if (!guestPhone?.trim()) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    if (!checkIn) return NextResponse.json({ error: "Check-in required" }, { status: 400 });
    if (!checkOut) return NextResponse.json({ error: "Check-out required" }, { status: 400 });

    const bookingCode = "BK" + Date.now().toString().slice(-8);
    const finalAmount = amount || 0;

    const guestsDataJson = additionalGuests && additionalGuests.length > 0
      ? JSON.stringify(additionalGuests)
      : null;

    await sql`
      INSERT INTO bookings (
        booking_code, property_id, guest_name, guest_phone,
        check_in, check_out, number_of_guests,
        amount, final_amount, payment_status, payment_method,
        utr_number, payment_sender_name,
        booking_source, status,
        id_proof_type, id_proof_number, guests_data,
        created_at
      ) VALUES (
        ${bookingCode}, ${propertyId}, ${guestName.trim()}, ${guestPhone.trim()},
        ${checkIn}, ${checkOut}, ${numberOfGuests || 1},
        ${finalAmount}, ${finalAmount},
        ${paymentStatus || "pending"}, ${paymentMethod || "cash"},
        ${utrNumber || null}, ${paymentSenderName || null},
        ${bookingSource || "direct"}, ${status || "confirmed"},
        ${idProofType || null}, ${idProofNumber || null}, ${guestsDataJson},
        NOW()
      )
    `;

    return NextResponse.json({ success: true, bookingCode });
  } catch (error) {
    console.error("Staff booking create error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
