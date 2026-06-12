import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("hostops_agent_token");
  return NextResponse.json({ success: true });
}
