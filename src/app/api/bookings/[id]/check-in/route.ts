import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
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

    // Check-in karte waqt:
    // 1. status = 'checked_in'
    // 2. payment_status = 'paid'  ← KEY FIX: ab se revenue + occupancy mein count hoga
    const rows = await sql`
      UPDATE bookings
      SET 
        status = 'checked_in',
        payment_status = 'paid'
      WHERE id = ${id} AND status = 'confirmed'
      RETURNING id, status, payment_status
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Booking not found or not in confirmed status" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking: rows[0] });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in guest" },
      { status: 500 }
    );
  }
}
