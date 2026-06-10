import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ owner: null }, { status: 200 });
    }
    return NextResponse.json({ owner: session.user }, { status: 200 });
  } catch {
    return NextResponse.json({ owner: null }, { status: 200 });
  }
}
