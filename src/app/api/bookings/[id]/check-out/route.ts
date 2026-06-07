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

    const rows = await sql`
      UPDATE bookings
      SET status = 'checked_out'
      WHERE id = ${id} AND status = 'checked_in'
      RETURNING id, status
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Booking not found or not in checked_in status" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: rows[0] });
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Failed to check out guest" },
      { status: 500 }
    );
  }
}
