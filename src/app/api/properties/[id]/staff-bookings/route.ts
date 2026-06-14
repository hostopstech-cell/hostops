import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const KNOWN_DIAL_CODES = ["+971", "+974", "+966", "+91", "+44", "+61", "+65", "+49", "+33", "+1"];

async function verifyToken(request: Request, propertyId: number) {
  const token = request.headers.get("x-staff-token");
  const props = await sql`SELECT p.id, p.name, p.staff_token, p.owner_id FROM properties p WHERE p.id = ${propertyId}`;
  if (!props.length) return null;
  const property = props[0];
  if (!token || token !== property.staff_token) return null;

  let dialCode = "+91";
  if (property.owner_id) {
    const ownerRows = await sql`SELECT phone FROM owners WHERE id = ${property.owner_id} LIMIT 1`;
    const ownerPhone = ownerRows[0]?.phone || "";
    const matched = KNOWN_DIAL_CODES.find(code => ownerPhone.startsWith(code));
    if (matched) dialCode = matched;
  }

  return { ...property, dialCode };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = parseInt(params.id, 10);
    const property = await verifyToken(request, propertyId);
    if (!property) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [bookings, rooms] = await Promise.all([
      sql`
        SELECT b.id, b.booking_code, b.guest_name, b.guest_phone,
               b.check_in, b.check_out, b.amount, b.final_amount,
               b.payment_status, b.payment_method, b.status,
               b.utr_number, b.payment_sender_name, b.payment_date,
               b.number_of_guests, b.booking_source, b.created_at,
               b.guests_data, b.id_proof_type, b.id_proof_number,
               b.room_id, r.name as room_name
        FROM bookings b
        LEFT JOIN rooms r ON r.id = b.room_id
        WHERE b.property_id = ${propertyId}
          AND b.created_at >= ${sevenDaysAgo.toISOString()}
        ORDER BY b.created_at DESC
      `,
      sql`SELECT id, name, type, price_per_night, number_of_beds FROM rooms WHERE property_id = ${propertyId} AND status = 'available' ORDER BY name`
    ]);

    return NextResponse.json({
      bookings,
      rooms,
      propertyName: property.name,
      dialCode: property.dialCode,
    });
  } catch (error) {
    console.error("Staff GET error:", error);
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
      numberOfGuests, status, bookingSource, roomId,
      idProofType, idProofNumber, additionalGuests
    } = body;

    if (!guestName?.trim()) return NextResponse.json({ error: "Guest name required" }, { status: 400 });
    if (!guestPhone?.trim()) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    if (!checkIn) return NextResponse.json({ error: "Check-in required" }, { status: 400 });
    if (!checkOut) return NextResponse.json({ error: "Check-out required" }, { status: 400 });
    if (checkIn >= checkOut) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

    const resolvedRoomId = roomId ? parseInt(roomId) : null;
    if (resolvedRoomId) {
      const roomRows = await sql`SELECT type, number_of_beds FROM rooms WHERE id = ${resolvedRoomId} LIMIT 1`;
      if (roomRows.length) {
        const r = roomRows[0];
        const isDorm = r.type === "dorm" || r.type === "mixed_dorm";
        if (isDorm) {
          const booked = await sql`
            SELECT COALESCE(SUM(number_of_guests), 0)::int AS booked FROM bookings
            WHERE room_id = ${resolvedRoomId} AND status NOT IN ('cancelled','checked_out')
            AND check_in < ${checkOut} AND check_out > ${checkIn}
          `;
          const avail = Number(r.number_of_beds) - Number(booked[0].booked);
          if (parseInt(numberOfGuests) > avail) return NextResponse.json({ error: `Only ${avail} bed(s) available for these dates` }, { status: 409 });
        } else {
          const overlap = await sql`
            SELECT COUNT(*)::int AS cnt FROM bookings
            WHERE room_id = ${resolvedRoomId} AND status NOT IN ('cancelled','checked_out')
            AND check_in < ${checkOut} AND check_out > ${checkIn}
          `;
          if (Number(overlap[0].cnt) > 0) return NextResponse.json({ error: "Room already booked for these dates" }, { status: 409 });
        }
      }
    }

    const bookingCode = "BK" + Date.now().toString().slice(-8);
    const finalAmount = parseFloat(amount) || 0;
    const guestsDataJson = additionalGuests?.length > 0 ? JSON.stringify(additionalGuests) : null;

    await sql`
      INSERT INTO bookings (
        booking_code, property_id, room_id, guest_name, guest_phone,
        check_in, check_out, number_of_guests,
        amount, final_amount, payment_status, payment_method,
        utr_number, payment_sender_name,
        booking_source, status,
        id_proof_type, id_proof_number, guests_data,
        created_at
      ) VALUES (
        ${bookingCode}, ${propertyId}, ${resolvedRoomId}, ${guestName.trim()}, ${guestPhone.trim()},
        ${checkIn}, ${checkOut}, ${parseInt(numberOfGuests) || 1},
        ${finalAmount}, ${finalAmount},
        ${paymentStatus || "pending"}, ${paymentMethod || "cash"},
        ${utrNumber || null}, ${paymentSenderName || null},
        ${bookingSource || "direct"}, ${status || "confirmed"},
        ${idProofType || null}, ${idProofNumber?.trim().toUpperCase() || null}, ${guestsDataJson},
        NOW()
      )
    `;

    return NextResponse.json({ success: true, bookingCode });
  } catch (error) {
    console.error("Staff booking create error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
