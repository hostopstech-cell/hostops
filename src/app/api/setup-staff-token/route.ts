import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS staff_token TEXT`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
