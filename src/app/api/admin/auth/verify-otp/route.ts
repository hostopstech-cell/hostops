import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "hostops.tech@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await sql`SELECT * FROM admin_otps WHERE email = ${ADMIN_EMAIL} ORDER BY created_at DESC LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "No OTP found. Request a new one." }, { status: 400 });
    const record = rows[0];
    if (record.otp !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    if (new Date(record.expires_at) < new Date()) return NextResponse.json({ error: "OTP expired." }, { status: 400 });
    await sql`DELETE FROM admin_otps WHERE email = ${ADMIN_EMAIL}`;
    const token = jwt.sign({ adminEmail: ADMIN_EMAIL, role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
    cookies().set("hostops_admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 8, path: "/" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
