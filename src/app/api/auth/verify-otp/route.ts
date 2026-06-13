import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT otp_code, otp_expires_at FROM owners WHERE id = ${owner.ownerId}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const record = rows[0];

    if (!record.otp_code || !record.otp_expires_at) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (new Date(record.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (record.otp_code !== otp) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // double-check email not taken by someone else (race condition safety)
    const existing = await sql`
      SELECT id FROM owners WHERE email = ${email} AND id != ${owner.ownerId}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "This email is already linked to another account" }, { status: 409 });
    }

    await sql`
      UPDATE owners
      SET email = ${email}, email_verified = true, otp_code = NULL, otp_expires_at = NULL
      WHERE id = ${owner.ownerId}
    `;

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    console.error("Verify OTP error:", error?.message || error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
