import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("hostops_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { phone, dialCode } = await request.json();

    // Validate
    if (!phone?.trim()) return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    if (!dialCode?.trim()) return NextResponse.json({ error: "Dial code required" }, { status: 400 });

    // Remove non-digits for length check
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      return NextResponse.json({ error: "Phone number must be at least 7 digits" }, { status: 400 });
    }

    // Store full number with dial code
    const fullPhone = dialCode + phone.trim();

    await sql`
      UPDATE owners
      SET phone = ${fullPhone}
      WHERE id = ${payload.ownerId}
    `;

    return NextResponse.json({ success: true, phone: fullPhone, dialCode });
  } catch (error) {
    console.error("Update phone error:", error);
    return NextResponse.json({ error: "Failed to update phone" }, { status: 500 });
  }
}
