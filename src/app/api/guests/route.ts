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
      SELECT
        g.id, g.name, g.phone, g.email, g.country, g.address,
        g.id_type, g.id_number, g.notes,
        g.total_stays, g.total_spent, g.last_visit, g.created_at,
        b.id        AS latest_booking_id,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.final_amount,
        b.status    AS booking_status,
        b.booking_source,
        p.name      AS property_name,
        r.name      AS room_name
      FROM guests g
      LEFT JOIN LATERAL (
        SELECT bk.id, bk.booking_code, bk.check_in, bk.check_out,
               bk.final_amount, bk.status, bk.booking_source,
               bk.property_id, bk.room_id
        FROM bookings bk
        WHERE bk.guest_phone = g.phone
          AND bk.owner_id = ${owner.ownerId}
        ORDER BY bk.created_at DESC
        LIMIT 1
      ) b ON true
      LEFT JOIN properties p ON p.id = b.property_id
      LEFT JOIN rooms r ON r.id = b.room_id
      WHERE g.owner_id = ${owner.ownerId}
      ORDER BY g.created_at DESC
    `;

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const statsRows = await sql`
      SELECT
        (SELECT COUNT(*) FROM guests WHERE owner_id = ${owner.ownerId})           AS total_guests,
        (SELECT COUNT(*) FROM bookings
          WHERE owner_id = ${owner.ownerId} AND status = 'checked_in')            AS currently_staying,
        (SELECT COUNT(*) FROM (
          SELECT guest_phone FROM bookings
          WHERE owner_id = ${owner.ownerId}
          GROUP BY guest_phone HAVING COUNT(*) > 1
        ) t)                                                                       AS repeat_guests,
        (SELECT COUNT(*) FROM bookings
          WHERE owner_id = ${owner.ownerId}
          AND status = 'confirmed'
          AND check_in >= ${today}
          AND check_in <= ${sevenDaysLater})                                       AS upcoming_checkins
    `;

    const stats = {
      totalGuests: Number(statsRows[0]?.total_guests ?? 0),
      currentlyStaying: Number(statsRows[0]?.currently_staying ?? 0),
      repeatGuests: Number(statsRows[0]?.repeat_guests ?? 0),
      upcomingCheckins: Number(statsRows[0]?.upcoming_checkins ?? 0),
    };

    return NextResponse.json({ guests, stats });
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
      INSERT INTO guests (owner_id, name, phone, email, country, address, id_type, id_number, notes)
      VALUES (
        ${owner.ownerId},
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
