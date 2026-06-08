import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await request.json();

    if (!Array.isArray(images) || images.length > 6) {
      return NextResponse.json(
        { error: "Max 6 images allowed" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE properties 
      SET images = ${images}
      WHERE id = ${params.id} AND owner_id = ${owner.ownerId}
      RETURNING id, images
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ property: result[0] });
  } catch (error) {
    console.error("Images update error:", error);
    return NextResponse.json({ error: "Failed to update images" }, { status: 500 });
  }
}
