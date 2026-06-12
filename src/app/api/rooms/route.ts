import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");
    let rooms;
    if (propertyId) {
      rooms = await sql`
        SELECT r.* FROM rooms r
        INNER JOIN properties p ON p.id = r.property_id
        WHERE r.property_id = ${parseInt(propertyId, 10)} AND p.owner_id = ${owner.ownerId}
        ORDER BY r.id
      `;
    } else {
      rooms = await sql`
        SELECT r.* FROM rooms r
        INNER JOIN properties p ON p.id = r.property_id
        WHERE p.owner_id = ${owner.ownerId}
        ORDER BY r.id
      `;
    }
    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      propertyId, name, type, capacity, pricePerNight, status,
      numberOfRooms = 1, startingRoomNumber,
    } = body;

    if (!propertyId || !name?.trim() || !type || !capacity || !pricePerNight) {
      return NextResponse.json({ error: "Property, name, type, capacity, and price are required" }, { status: 400 });
    }

    const count = Math.max(1, parseInt(String(numberOfRooms), 10) || 1);

    // Check property ownership and get max rooms allowed
    const propRows = await sql`
      SELECT id, total_beds FROM properties
      WHERE id = ${parseInt(propertyId, 10)} AND owner_id = ${owner.ownerId}
    `;
    if (propRows.length === 0) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const maxRoomsAllowed = Number(propRows[0].total_beds);
    const usedRows = await sql`
      SELECT COUNT(*)::int AS used FROM rooms WHERE property_id = ${parseInt(propertyId, 10)}
    `;
    const usedRooms = Number(usedRows[0].used);
    const remainingSlots = maxRoomsAllowed - usedRooms;

    if (remainingSlots <= 0) {
      return NextResponse.json({
        error: `Room limit reached. This property allows max ${maxRoomsAllowed} rooms. Go to Property settings to increase the limit.`
      }, { status: 400 });
    }

    if (count > remainingSlots) {
      return NextResponse.json({
        error: `Only ${remainingSlots} room slot${remainingSlots !== 1 ? "s" : ""} remaining. Reduce the number of rooms or increase the limit in Property settings.`
      }, { status: 400 });
    }

    // Single room — original behaviour
    if (count === 1) {
      const rows = await sql`
        INSERT INTO rooms (property_id, name, type, number_of_beds, price_per_night, status)
        VALUES (${parseInt(propertyId, 10)}, ${name.trim()}, ${type}, ${Number(capacity)}, ${Number(pricePerNight)}, ${status || "available"})
        RETURNING *
      `;
      return NextResponse.json({ room: rows[0], rooms: [rows[0]] }, { status: 201 });
    }

    // Bulk insert — generate names like "Room 101", "Room 102" or "Dorm A-1", "Dorm A-2"
    const startNum = parseInt(String(startingRoomNumber), 10) || 1;
    const baseName = name.trim();
    const createdRooms = [];

    for (let i = 0; i < count; i++) {
      const roomNum = startNum + i;
      const roomName = `${baseName} ${roomNum}`;
      const rows = await sql`
        INSERT INTO rooms (property_id, name, type, number_of_beds, price_per_night, status)
        VALUES (${parseInt(propertyId, 10)}, ${roomName}, ${type}, ${Number(capacity)}, ${Number(pricePerNight)}, ${status || "available"})
        RETURNING *
      `;
      createdRooms.push(rows[0]);
    }

    return NextResponse.json({ rooms: createdRooms, room: createdRooms[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
