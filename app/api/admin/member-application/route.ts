import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession, hasRole } from "@/lib/admin-auth";
import { setMemberApplicationStatus } from "@/lib/member-signup-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  
  // Require at least staff role
  if (!hasRole(session, "staff")) {
    return NextResponse.json({ ok: false, error: "Insufficient permissions." }, { status: 403 });
  }

  let id = "";
  let action: string = "";
  try {
    const body = (await request.json()) as { id?: string; action?: string };
    id = typeof body.id === "string" ? body.id.trim() : "";
    action = typeof body.action === "string" ? body.action.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!id || id.length > 96) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const applicationStatus =
    action === "accept" ? "accepted" : action === "reject" ? "rejected" : null;
  if (!applicationStatus) {
    return NextResponse.json(
      { ok: false, error: 'Use action "accept" or "reject".' },
      { status: 400 },
    );
  }

  const ok = await setMemberApplicationStatus(id, applicationStatus);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Could not update application (not found or storage error)." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
