import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const ADMIN_EMAIL = "hostops.tech@gmail.com";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "HostOps@Admin2024";
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await sql`INSERT INTO admin_otps (email, otp, expires_at) VALUES (${ADMIN_EMAIL}, ${otp}, ${expiresAt.toISOString()}) ON CONFLICT (email) DO UPDATE SET otp = ${otp}, expires_at = ${expiresAt.toISOString()}, created_at = NOW()`;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "HostOps <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: "HostOps Admin OTP",
          html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0f172a;color:#fff;border-radius:16px;"><div style="font-size:24px;font-weight:900;color:#ea580c;margin-bottom:8px;">HostOps</div><div style="font-size:14px;color:#94a3b8;margin-bottom:24px;">Admin Panel Access</div><div style="font-size:13px;color:#cbd5e1;margin-bottom:12px;">Your OTP:</div><div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#fff;background:#1e293b;padding:20px;border-radius:12px;text-align:center;margin-bottom:16px;">${otp}</div><div style="font-size:12px;color:#64748b;">Valid for 10 minutes.</div></div>`,
        }),
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
