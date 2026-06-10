import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getAuthenticatedOwner();
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { utr_number, payment_sender_name, payment_date } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE bookings SET utr_number=${utr_number}, payment_sender_name=${payment_sender_name}, payment_date=${payment_date}, payment_status='paid', status='confirmed' WHERE id=${params.id}`;
  return NextResponse.json({ success: true });
}
