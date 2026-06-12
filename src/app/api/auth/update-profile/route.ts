import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthenticatedOwner, hashPassword, verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    // Name + Phone update
    if (name?.trim()) {
      await sql`
        UPDATE owners SET
          name = ${name.trim()},
          phone = ${phone?.trim() || null}
        WHERE id = ${owner.ownerId}
      `;

      // Cookie mein naam update karo
      const newToken = signToken({
        ownerId: owner.ownerId,
        email: owner.email,
        name: name.trim(),
      });
      await setAuthCookie(newToken);
    }

    // Password update (optional)
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      const rows = await sql`
        SELECT password_hash FROM owners WHERE id = ${owner.ownerId}
      `;
      if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const valid = await verifyPassword(currentPassword, rows[0].password_hash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      await sql`
        UPDATE owners SET password_hash = ${newHash} WHERE id = ${owner.ownerId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
