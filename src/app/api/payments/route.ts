import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { PaymentMethod, PaymentStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_PAYMENT_METHODS: PaymentMethod[] = ["upi", "cash", "card", "bank_transfer"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["paid", "pending", "partial", "refunded"];

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await sql`
      SELECT id, booking_id, guest_name, amount, date, method, status, notes, created_at
      FROM payments
      ORDER BY created_at DESC
    `;

    const today = new Date().toISOString().split("T")[0];
    const monthStart = `${today.slice(0, 8)}01`;

    const [todayResult, monthResult, pendingResult] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments WHERE date = ${today}::date AND status = 'paid'`,
      sql`SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments WHERE date >= ${monthStart}::date AND status = 'paid'`,
      sql`SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments WHERE status = 'pending'`,
    ]);

    const summary = {
      todayCollection: todayResult[0]?.total || 0,
      monthlyCollection: monthResult[0]?.total || 0,
      pendingAmount: pendingResult[0]?.total || 0,
    };

    return NextResponse.json({ payments, summary });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, guestName, amount, date, method, status, notes } = body;

    if (!bookingId || !guestName?.trim() || !amount || !date) {
      return NextResponse.json(
        { error: "Booking ID, guest name, amount, and date are required" },
        { status: 400 }
      );
    }

    if (method && !VALID_PAYMENT_METHODS.includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (status && !VALID_PAYMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json(
        { error: "Amount must be a non-negative number" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO payments (booking_id, guest_name, amount, date, method, status, notes)
      VALUES (${bookingId}, ${guestName.trim()}, ${amt}, ${date}, ${method || 'upi'}, ${status || 'paid'}, ${notes?.trim() || null})
      RETURNING id, booking_id, guest_name, amount, date, method, status, notes, created_at
    `;

    return NextResponse.json({ payment: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
