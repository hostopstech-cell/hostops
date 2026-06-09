import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { BookingStatus, BookingSource, PaymentMethod } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
const VALID_SOURCES: BookingSource[] = ["direct", "walk_in", "airbnb", "booking_com", "goibibo", "makemytrip", "hostelworld", "other"];
const VALID_PAYMENT_METHODS: PaymentMethod[] = ["upi", "cash", "card", "bank_transfer"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await sql`
      SELECT b.id, b.booking_code, b.property_id, b.room_id, b.bed_id,
             b.guest_name, b.guest_phone, b.guest_email, b.check_in, b.check_out,
             b.number_of_guests, b.amount, b.discount, b.final_amount,
             b.payment_method, b.payment_status, b.booking_source,
             b.special_requests, b.notes, b.status, b.created_at,
             b.id_proof_type, b.id_proof_number,
             p.name as property_name
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE p.owner_id = ${owner.id}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      guestName, guestPhone, guestEmail,
      idProofType, idProofNumber,
      propertyId, roomId, bedId,
      checkIn, checkOut, numberOfGuests,
      amount, discount,
      paymentMethod, paymentStatus, bookingSource,
      specialRequests, notes, bookingCode, status
    } = body;

    if (!guestName?.trim()) return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    if (!guestPhone?.trim()) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    if (!propertyId) return NextResponse.json({ error: "Property is required" }, { status: 400 });
    if (!checkIn) return NextResponse.json({ error: "Check-in date is required" }, { status: 400 });
    if (!checkOut) return NextResponse.json({ error: "Check-out date is required" }, { status: 400 });
    if (!numberOfGuests) return NextResponse.json({ error: "Number of guests is required" }, { status: 400 });
    if (!amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });

    const guests = parseInt(numberOfGuests, 10);
    const amt = parseFloat(amount);
    const disc = parseFloat(discount || "0");
    const final = amt - disc;

    const rows = await sql`
      INSERT INTO bookings (
        property_id, room_id, bed_id, guest_name, guest_phone, guest_email,
        check_in, check_out, number_of_guests, amount, discount, final_amount,
        payment_method, payment_status, booking_source,
        special_requests, notes, booking_code, status,
        id_proof_type, id_proof_number
      )
      VALUES (
        ${propertyId}, ${roomId || null}, ${bedId || null},
        ${guestName.trim()}, ${guestPhone.trim()}, ${guestEmail?.trim() || null},
        ${checkIn}, ${checkOut}, ${guests}, ${amt}, ${disc}, ${final},
        ${paymentMethod || 'upi'}, ${paymentStatus || 'paid'}, ${bookingSource || 'direct'},
        ${specialRequests?.trim() || null}, ${notes?.trim() || null},
        ${bookingCode || 'BK' + Date.now()}, ${status || 'confirmed'},
        ${idProofType || null}, ${idProofNumber?.trim() || null}
      )
      RETURNING id, booking_code, property_id, room_id, bed_id,
                guest_name, guest_phone, guest_email, check_in, check_out,
                number_of_guests, amount, discount, final_amount,
                payment_method, payment_status, booking_source,
                special_requests, notes, status, created_at,
                id_proof_type, id_proof_number
    `;

    return NextResponse.json({ booking: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
