import { NextResponse } from "next/server";
import { hasAnyAdmins } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  // Check if bootstrap is disabled
  if (process.env.ADMIN_BOOTSTRAP_DISABLED === "true") {
    return NextResponse.json({ needsBootstrap: false });
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ needsBootstrap: false });
  }

  // Check if ADMIN_PASSWORD is set
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword || adminPassword.length < 8) {
    return NextResponse.json({ needsBootstrap: false });
  }

  // Check if any admins exist
  const adminsExist = await hasAnyAdmins();

  return NextResponse.json({ needsBootstrap: !adminsExist });
}
