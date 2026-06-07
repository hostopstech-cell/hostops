import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { BedType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_BED_TYPES: BedType[] = ["upper", "lower", "normal"];

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
      return NextResponse.json({ error: "Invalid bed ID" }, { status: 400 });
    }

    const body = await request.json();
    const { bedNumber, bedType, pricePerNight, status } = body;

    if (!bedNumber?.trim() || !pricePerNight) {
      return NextResponse.json(
        { error: "Bed number and price are required" },
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
      UPDATE beds
      SET
        bed_number = ${bedNumber.trim()},
        bed_type = ${bedType || 'normal'},
        price_per_night = ${price},
        status = ${status || 'available'}
      WHERE id = ${id}
      RETURNING id, room_id, bed_number, bed_type, price_per_night, status, created_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    return NextResponse.json({ bed: rows[0] });
  } catch (error) {
    console.error("Bed update error:", error);
    return NextResponse.json(
      { error: "Failed to update bed" },
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
      return NextResponse.json({ error: "Invalid bed ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM beds WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bed delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete bed" },
      { status: 500 }
    );
  }
}
