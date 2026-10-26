import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/analytics-storage";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
