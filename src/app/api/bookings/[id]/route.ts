import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { BookingStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });

    const body = await request.json();
    const { guestName, guestPhone, guestEmail, idProofType, idProofNumber,
            propertyId, roomId, bedId, checkIn, checkOut, numberOfGuests,
            amount, discount, paymentMethod, paymentStatus, bookingSource,
            specialRequests, notes, status, bookingCode,
            utrNumber, paymentSenderName, paymentDate } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid booking status" }, { status: 400 });
    }

    const current = await sql`
      SELECT b.*, p.owner_id FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.id = ${id} AND p.owner_id = ${owner.ownerId}
      LIMIT 1
    `;
    if (!current.length) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const disc = discount ?? current[0].discount;
    const amt = amount || current[0].amount;
    const finalAmount = parseFloat(amt) - parseFloat(disc || 0);

    const rows = await sql`
      UPDATE bookings SET
        guest_name = ${guestName || current[0].guest_name},
        guest_phone = ${guestPhone || current[0].guest_phone},
        guest_email = ${guestEmail ?? current[0].guest_email},
        id_proof_type = ${idProofType ?? current[0].id_proof_type},
        id_proof_number = ${idProofNumber ?? current[0].id_proof_number},
        check_in = ${checkIn || current[0].check_in},
        check_out = ${checkOut || current[0].check_out},
        number_of_guests = ${numberOfGuests || current[0].number_of_guests},
        amount = ${amt},
        discount = ${disc},
        final_amount = ${finalAmount},
        payment_method = ${paymentMethod || current[0].payment_method},
        payment_status = ${paymentStatus || current[0].payment_status},
        booking_source = ${bookingSource || current[0].booking_source},
        special_requests = ${specialRequests ?? current[0].special_requests},
        notes = ${notes ?? current[0].notes},
        status = ${status || current[0].status},
        utr_number = ${utrNumber ?? current[0].utr_number},
        payment_sender_name = ${paymentSenderName ?? current[0].payment_sender_name},
        payment_date = ${paymentDate ?? current[0].payment_date}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!rows.length) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ booking: rows[0] });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });

    const current = await sql`
      SELECT b.id FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.id = ${id} AND p.owner_id = ${owner.ownerId}
      LIMIT 1
    `;
    if (!current.length) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking delete error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
