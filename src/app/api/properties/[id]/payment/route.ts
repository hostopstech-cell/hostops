import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getAuthenticatedOwner();
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { upi_id, payment_name } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE properties SET upi_id=${upi_id}, payment_name=${payment_name} WHERE id=${params.id} AND owner_id=${owner.ownerId}`;
  return NextResponse.json({ success: true });
}
