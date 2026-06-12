import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { PropertyType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_TYPES: PropertyType[] = ["hotel", "hostel", "dorm", "guesthouse"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await sql`
      SELECT p.id, p.owner_id, p.name, p.type, p.address, p.city, p.state, p.pincode, p.contact, p.email,
             p.description, p.check_in_time, p.check_out_time, p.amenities, p.policies,
             p.google_map_link, p.upi_id, p.payment_name, p.bot_enabled, p.total_beds, p.status, p.images, p.created_at,
             COUNT(b.id) FILTER (WHERE b.status IN ('confirmed', 'checked_in')) AS occupied_beds
      FROM properties p
      LEFT JOIN bookings b ON b.property_id = p.id
      WHERE p.owner_id = ${owner.ownerId}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Properties fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan aur limit check karo
    const ownerRows = await sql`
      SELECT subscription_plan, subscription_ends_at, properties_limit, trial_starts_at
      FROM owners WHERE id = ${owner.ownerId}
    `;

    if (!ownerRows.length) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const ownerData = ownerRows[0];
    const now = new Date();

    // Subscription active hai ya nahi check karo
    const isOnTrial = ownerData.subscription_plan === "trial";
    const trialStart = ownerData.trial_starts_at ? new Date(ownerData.trial_starts_at) : new Date(0);
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const trialExpired = isOnTrial && now > trialEnd;

    const subscriptionActive =
      !isOnTrial &&
      ownerData.subscription_ends_at &&
      new Date(ownerData.subscription_ends_at) > now;

    if (trialExpired) {
      return NextResponse.json(
        { error: "Trial expired. Please subscribe to add properties.", code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    if (!isOnTrial && !subscriptionActive) {
      return NextResponse.json(
        { error: "Subscription expired. Please renew to add properties.", code: "SUBSCRIPTION_EXPIRED" },
        { status: 403 }
      );
    }

    // Property limit check karo
    const propertiesLimit = ownerData.properties_limit || 1;
    const countRows = await sql`
      SELECT COUNT(*) as count FROM properties WHERE owner_id = ${owner.ownerId}
    `;
    const currentCount = parseInt(countRows[0].count, 10);

    if (currentCount >= propertiesLimit) {
      return NextResponse.json(
        {
          error: `Aapke ${ownerData.subscription_plan} plan mein sirf ${propertiesLimit} ${propertiesLimit === 1 ? "property" : "properties"} allowed ${propertiesLimit === 1 ? "hai" : "hain"}. Upgrade karen!`,
          code: "PROPERTY_LIMIT_REACHED",
          limit: propertiesLimit,
          current: currentCount,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name, type, address, city, state, totalBeds,
      pincode, contact, email, description,
      checkInTime, checkOutTime, amenities, policies,
      googleMapLink, upiId, status, images,
    } = body;

    if (!name?.trim() || !type || !address?.trim() || !city?.trim() || !state?.trim()) {
      return NextResponse.json(
        { error: "Name, type, address, city, and state are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
    }

    const beds = parseInt(totalBeds, 10);
    if (isNaN(beds) || beds <= 0) {
      return NextResponse.json({ error: "Total beds must be a positive number" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO properties (
        owner_id, name, type, address, city, state, pincode, contact, email,
        description, check_in_time, check_out_time, amenities, policies,
        google_map_link, upi_id, total_beds, status, images
      )
      VALUES (
        ${owner.ownerId}, ${name.trim()}, ${type}, ${address.trim()}, ${city.trim()},
        ${state.trim()}, ${pincode?.trim() || null}, ${contact?.trim() || null},
        ${email?.trim() || null}, ${description?.trim() || null},
        ${checkInTime || "14:00"}, ${checkOutTime || "11:00"},
        ${amenities || null}, ${policies?.trim() || null},
        ${googleMapLink?.trim() || null}, ${upiId?.trim() || null},
        ${beds}, ${status || "active"}, ${images || "{}"}
      )
      RETURNING id, owner_id, name, type, address, city, state, pincode, contact, email,
               description, check_in_time, check_out_time, amenities, policies,
               google_map_link, upi_id, total_beds, status, images, created_at
    `;

    return NextResponse.json({ property: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Property create error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
