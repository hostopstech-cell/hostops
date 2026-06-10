import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getAuthenticatedOwner();
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bot_enabled } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE properties SET bot_enabled=${bot_enabled} WHERE id=${params.id} AND owner_id=${owner.ownerId}`;
  return NextResponse.json({ success: true });
}
