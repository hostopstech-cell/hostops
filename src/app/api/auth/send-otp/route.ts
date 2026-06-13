import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const newEmail = body.email?.toLowerCase().trim();

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const existing = await sql`
      SELECT id FROM owners WHERE email = ${newEmail} AND id != ${owner.ownerId}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "This email is already linked to another account" }, { status: 409 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sql`
      UPDATE owners SET otp_code = ${otp}, otp_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${owner.ownerId}
    `;

    await resend.emails.send({
      from: "HostOps <noreply@hostops.in>",
      to: newEmail,
      subject: "Your HostOps Verification Code",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#ea580c;">HostOps Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#fff7ed;color:#ea580c;padding:16px;border-radius:12px;text-align:center;">${otp}</div>
        <p style="color:#64748b;font-size:13px;margin-top:16px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>`,
    });

    return NextResponse.json({ success: true, email: newEmail });
  } catch (error: any) {
    console.error("Send OTP error:", error?.message || error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
