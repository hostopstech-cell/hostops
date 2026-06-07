import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { PropertyType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_TYPES: PropertyType[] = ["hotel", "hostel", "dorm", "guesthouse"];

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
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name, type, address, city, state, totalBeds,
      pincode, contact, email, description,
      checkInTime, checkOutTime, amenities, policies,
      googleMapLink, upiId, status
    } = body;

    if (!name?.trim() || !type || !address?.trim() || !city?.trim() || !state?.trim()) {
      return NextResponse.json(
        { error: "Name, type, address, city, and state are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid property type" },
        { status: 400 }
      );
    }

    const beds = parseInt(totalBeds, 10);
    if (isNaN(beds) || beds <= 0) {
      return NextResponse.json(
        { error: "Total beds must be a positive number" },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE properties
      SET
        name = ${name.trim()},
        type = ${type},
        address = ${address.trim()},
        city = ${city.trim()},
        state = ${state.trim()},
        pincode = ${pincode?.trim() || null},
        contact = ${contact?.trim() || null},
        email = ${email?.trim() || null},
        description = ${description?.trim() || null},
        check_in_time = ${checkInTime || '14:00'},
        check_out_time = ${checkOutTime || '11:00'},
        amenities = ${amenities || null},
        policies = ${policies?.trim() || null},
        google_map_link = ${googleMapLink?.trim() || null},
        upi_id = ${upiId?.trim() || null},
        total_beds = ${beds},
        status = ${status || 'active'}
      WHERE id = ${id} AND owner_id = ${owner.ownerId}
      RETURNING id, owner_id, name, type, address, city, state, pincode, contact, email,
               description, check_in_time, check_out_time, amenities, policies,
               google_map_link, upi_id, total_beds, status, created_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ property: rows[0] });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
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
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM properties
      WHERE id = ${id} AND owner_id = ${owner.ownerId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Property delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
