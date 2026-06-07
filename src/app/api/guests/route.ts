import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { IDType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ID_TYPES: IDType[] = ["aadhar", "passport", "driving_license", "voter_id"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guests = await sql`
      SELECT id, name, phone, email, country, address, id_type, id_number,
             total_stays, total_spent, last_visit, created_at
      FROM guests
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Guests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
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
      INSERT INTO guests (name, phone, email, country, address, id_type, id_number, notes)
      VALUES (
        ${name.trim()},
        ${phone.trim()},
        ${email?.trim() || null},
        ${country || 'India'},
        ${address?.trim() || null},
        ${idType || null},
        ${idNumber?.trim() || null},
        ${notes?.trim() || null}
      )
      RETURNING id, name, phone, email, country, address, id_type, id_number, notes, created_at
    `;

    return NextResponse.json({ guest: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Guest create error:", error);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
}
