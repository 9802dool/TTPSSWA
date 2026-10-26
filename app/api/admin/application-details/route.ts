import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getApplicationById } from "@/lib/supabase/applications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  
  if (!token || !verifyAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Application ID required" }, { status: 400 });
  }

  const details = await getApplicationById(id);

  if (!details) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({
    documents: details.documents,
    history: details.history,
  });
}
