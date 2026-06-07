import { NextResponse } from "next/server";
import { getAuthenticatedOwner } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(owner.ownerId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
