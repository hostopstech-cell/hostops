import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created: {path}")

# 1. API: Update property payment details
write('src/app/api/properties/[id]/payment/route.ts', '''import { NextRequest, NextResponse } from "next/server";
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
''')

# 2. API: Update booking UTR
write('src/app/api/bookings/[id]/utr/route.ts', '''import { NextRequest, NextResponse } from "next/server";
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
''')

print("API files created!")

