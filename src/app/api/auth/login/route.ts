import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, name, email, password_hash
      FROM owners
      WHERE email = ${email.toLowerCase().trim()}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const owner = rows[0];
    const valid = await verifyPassword(password, owner.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
