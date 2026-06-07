import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { BedType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_BED_TYPES: BedType[] = ["upper", "lower", "normal"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const beds = await sql`
      SELECT b.id, b.room_id, b.bed_number, b.bed_type, b.price_per_night,
             b.status, b.created_at, r.name as room_name, p.name as property_name
      FROM beds b
      JOIN rooms r ON r.id = b.room_id
      JOIN properties p ON p.id = r.property_id
      WHERE p.owner_id = ${owner.ownerId}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ beds });
  } catch (error) {
    console.error("Beds fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch beds" },
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
    const { roomId, bedNumber, bedType, pricePerNight, status } = body;

    if (!roomId || !bedNumber?.trim() || !pricePerNight) {
      return NextResponse.json(
        { error: "Room ID, bed number, and price are required" },
        { status: 400 }
      );
    }

    if (bedType && !VALID_BED_TYPES.includes(bedType)) {
      return NextResponse.json(
        { error: "Invalid bed type" },
        { status: 400 }
      );
    }

    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO beds (room_id, bed_number, bed_type, price_per_night, status)
      VALUES (${roomId}, ${bedNumber.trim()}, ${bedType || 'normal'}, ${price}, ${status || 'available'})
      RETURNING id, room_id, bed_number, bed_type, price_per_night, status, created_at
    `;

    return NextResponse.json({ bed: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Bed create error:", error);
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    );
  }
}
