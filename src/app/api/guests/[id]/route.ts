import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { IDType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ID_TYPES: IDType[] = ["aadhar", "passport", "driving_license", "voter_id"];

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
      return NextResponse.json({ error: "Invalid guest ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, phone, email, country, address, idType, idNumber, notes } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    if (idType && !VALID_ID_TYPES.includes(idType)) {
      return NextResponse.json(
        { error: "Invalid ID type" },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE guests
      SET
        name = ${name.trim()},
        phone = ${phone.trim()},
        email = ${email?.trim() || null},
        country = ${country || 'India'},
        address = ${address?.trim() || null},
        id_type = ${idType || null},
        id_number = ${idNumber?.trim() || null},
        notes = ${notes?.trim() || null}
      WHERE id = ${id}
      RETURNING id, name, phone, email, country, address, id_type, id_number, notes, created_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest: rows[0] });
  } catch (error) {
    console.error("Guest update error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
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
      return NextResponse.json({ error: "Invalid guest ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM guests WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
