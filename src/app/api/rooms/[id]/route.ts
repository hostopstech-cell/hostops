import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { RoomType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ROOM_TYPES: RoomType[] = ["dorm", "private", "deluxe", "family"];

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
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const body = await request.json();
    const { propertyId, name, type, capacity, pricePerNight, status } = body;

    if (!propertyId || !name?.trim() || !type || !capacity || !pricePerNight) {
      return NextResponse.json(
        { error: "Property ID, name, type, capacity, and price are required" },
        { status: 400 }
      );
    }

    if (!VALID_ROOM_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid room type" },
        { status: 400 }
      );
    }

    const cap = parseInt(capacity, 10);
    const price = parseFloat(pricePerNight);

    if (isNaN(cap) || cap <= 0) {
      return NextResponse.json(
        { error: "Capacity must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE rooms
      SET
        property_id = ${propertyId},
        name = ${name.trim()},
        type = ${type},
        capacity = ${cap},
        price_per_night = ${price},
        status = ${status || 'available'}
      WHERE id = ${id}
      RETURNING id, property_id, name, type, capacity, price_per_night, status, created_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: rows[0] });
  } catch (error) {
    console.error("Room update error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
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
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM rooms WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Room delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
