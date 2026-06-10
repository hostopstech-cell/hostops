import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { name, type, address, city, state, totalBeds, pincode, contactNumber, email, description, checkInTime, checkOutTime, amenities, googleMapLink, upiId, paymentName, status } = body;
    const beds = parseInt(totalBeds, 10);
    const rows = await sql`UPDATE properties SET name=${name?.trim()}, type=${type}, address=${address?.trim()}, city=${city?.trim()}, state=${state?.trim()}, pincode=${pincode?.trim()||null}, contact=${contactNumber?.trim()||null}, email=${email?.trim()||null}, description=${description?.trim()||null}, check_in_time=${checkInTime||"14:00"}, check_out_time=${checkOutTime||"11:00"}, amenities=${amenities||null}, google_map_link=${googleMapLink?.trim()||null}, upi_id=${upiId?.trim()||null}, payment_name=${paymentName?.trim()||null}, total_beds=${beds}, status=${status||"active"} WHERE id=${id} AND owner_id=${owner.ownerId} RETURNING id`;
    if (rows.length === 0) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = parseInt(params.id, 10);
    const rows = await sql`DELETE FROM properties WHERE id=${id} AND owner_id=${owner.ownerId} RETURNING id`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
