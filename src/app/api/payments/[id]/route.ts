import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner } from "@/lib/auth";
import type { PaymentMethod, PaymentStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_PAYMENT_METHODS: PaymentMethod[] = ["upi", "cash", "card", "bank_transfer"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["paid", "pending", "partial", "refunded"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
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
      UPDATE payments
      SET
        booking_id = ${bookingId},
        guest_name = ${guestName.trim()},
        amount = ${amt},
        date = ${date},
        method = ${method || 'upi'},
        status = ${status || 'paid'},
        notes = ${notes?.trim() || null}
      WHERE id = ${id}
      RETURNING id, booking_id, guest_name, amount, date, method, status, notes, created_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment: rows[0] });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM payments WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
