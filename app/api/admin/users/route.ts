import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminSession,
  getAdminCookieName,
  hasRole,
  listAdminUsers,
  createAdminUser,
  updateAdminActive,
  updateAdminRole,
  type AdminRole,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session || !hasRole(session, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const admins = await listAdminUsers();
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session || !hasRole(session, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  let body: {
    action?: string;
    email?: string;
    full_name?: string;
    password?: string;
    role?: AdminRole;
    id?: string;
    active?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  if (action === "create") {
    const { email, full_name, password, role } = body;

    if (!email || !full_name || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["super_admin", "staff", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const result = await createAdminUser({
      email,
      full_name,
      password,
      role,
      created_by: session.userId,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: result.id });
  }

  if (action === "update_active") {
    const { id, active } = body;

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Prevent deactivating yourself
    if (id === session.userId && !active) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 },
      );
    }

    const success = await updateAdminActive(id, active);
    if (!success) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "update_role") {
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["super_admin", "staff", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent changing your own role
    if (id === session.userId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 },
      );
    }

    const success = await updateAdminRole(id, role as AdminRole);
    if (!success) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
