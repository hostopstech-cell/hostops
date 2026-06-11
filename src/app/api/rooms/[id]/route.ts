import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { RoomType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ROOM_TYPES: RoomType[] = ["dorm", "female_dorm", "male_dorm", "private", "ac_room", "non_ac_room", "deluxe", "family"];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });

    const body = await request.json();
    const { propertyId, name, type, capacity, pricePerNight, status } = body;

    if (!propertyId || !name?.trim() || !type || !capacity || !pricePerNight) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (!VALID_ROOM_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid room type" }, { status: 400 });
    }

    const cap = parseInt(capacity, 10);
    const price = parseFloat(pricePerNight);

    // Verify ownership
    const ownerCheck = await sql`
      SELECT r.id FROM rooms r
      INNER JOIN properties p ON p.id = r.property_id
      WHERE r.id = ${id} AND p.owner_id = ${owner.ownerId}
    `;
    if (ownerCheck.length === 0) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const rows = await sql`
      UPDATE rooms
      SET property_id = ${parseInt(propertyId, 10)},
          name = ${name.trim()},
          type = ${type},
          number_of_beds = ${cap},
          price_per_night = ${price},
          status = ${status || "available"}
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json({ room: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });

    const ownerCheck = await sql`
      SELECT r.id FROM rooms r
      INNER JOIN properties p ON p.id = r.property_id
      WHERE r.id = ${id} AND p.owner_id = ${owner.ownerId}
    `;
    if (ownerCheck.length === 0) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    await sql`DELETE FROM bookings WHERE room_id = ${id}`;
    await sql`DELETE FROM beds WHERE room_id = ${id}`;
    await sql`DELETE FROM rooms WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
