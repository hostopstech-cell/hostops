import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { RoomType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ROOM_TYPES: RoomType[] = ["dorm", "private", "deluxe", "family"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await sql`
      SELECT r.id, r.property_id, r.name, r.type, r.capacity, r.price_per_night,
             r.status, r.created_at, p.name as property_name
      FROM rooms r
      JOIN properties p ON p.id = r.property_id
      WHERE p.owner_id = ${owner.ownerId}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Rooms fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      INSERT INTO rooms (property_id, name, type, capacity, price_per_night, status)
      VALUES (${propertyId}, ${name.trim()}, ${type}, ${cap}, ${price}, ${status || 'available'})
      RETURNING id, property_id, name, type, capacity, price_per_night, status, created_at
    `;

    return NextResponse.json({ room: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Room create error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
