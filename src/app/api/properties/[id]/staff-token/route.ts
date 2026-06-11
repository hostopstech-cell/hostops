import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = parseInt(params.id, 10);
    const { staff_token } = await request.json();
    if (!staff_token?.trim()) return NextResponse.json({ error: "Token required" }, { status: 400 });
    await sql`UPDATE properties SET staff_token = ${staff_token.trim()} WHERE id = ${id} AND owner_id = ${owner.ownerId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
