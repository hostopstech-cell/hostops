import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { BookingStatus, BookingSource, PaymentMethod } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      guestName, guestPhone, guestEmail, propertyId, roomId, bedId,
      checkIn, checkOut, numberOfGuests, amount, discount,
      paymentMethod, paymentStatus, bookingSource,
      specialRequests, notes, status,
      idProofType, idProofNumber
    } = body;

    if (!guestName?.trim() || !guestPhone?.trim() || !propertyId || !checkIn || !checkOut || !numberOfGuests || !amount) {
      return NextResponse.json(
        { error: "Guest name, phone, property, check-in, check-out, guests, and amount are required" },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status" },
        { status: 400 }
      );
    }

    const guests = parseInt(numberOfGuests, 10);
    const amt = parseFloat(amount);
    const disc = parseFloat(discount || "0");
    const final = amt - disc;

    if (isNaN(guests) || guests <= 0) {
      return NextResponse.json(
        { error: "Number of guests must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(amt) || amt < 0) {
      return NextResponse.json(
        { error: "Amount must be a non-negative number" },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE bookings
      SET
        property_id = ${propertyId},
        room_id = ${roomId || null},
        bed_id = ${bedId || null},
        guest_name = ${guestName.trim()},
        guest_phone = ${guestPhone.trim()},
        guest_email = ${guestEmail?.trim() || null},
        check_in = ${checkIn},
        check_out = ${checkOut},
        number_of_guests = ${guests},
        amount = ${amt},
        discount = ${disc},
        final_amount = ${final},
        payment_method = ${paymentMethod || null},
        payment_status = ${paymentStatus || 'pending'},
        booking_source = ${bookingSource || 'direct'},
        special_requests = ${specialRequests?.trim() || null},
        notes = ${notes?.trim() || null},
        id_proof_type = ${idProofType || null},
        id_proof_number = ${idProofNumber?.trim() || null},
        status = ${status || 'confirmed'}
      WHERE id = ${id}
      RETURNING id, booking_code, property_id, room_id, bed_id, guest_name, guest_phone, guest_email,
              check_in, check_out, number_of_guests, amount, discount, final_amount,
              payment_method, payment_status, booking_source, special_requests, notes, status, created_at,
              id_proof_type, id_proof_number
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking: rows[0] });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM bookings WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
