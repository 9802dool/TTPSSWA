import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { getAdminStats } from "@/lib/analytics-storage";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
