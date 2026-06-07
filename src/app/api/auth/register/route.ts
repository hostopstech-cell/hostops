import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM owners WHERE email = ${email.toLowerCase().trim()}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const rows = await sql`
      INSERT INTO owners (name, email, password_hash)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${passwordHash})
      RETURNING id, name, email, created_at
    `;

    const owner = rows[0];
    const token = signToken({
      ownerId: owner.id,
      email: owner.email,
      name: owner.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register owner" },
      { status: 500 }
    );
  }
}
