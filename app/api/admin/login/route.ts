import { NextResponse } from "next/server";
import {
  getAdminCookieName,
  signAdminSession,
  authenticateAdmin,
  checkBootstrapAdmin,
  hasAnyAdmins,
  bootstrapFirstAdmin,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let email = "";
  let password = "";
  let bootstrapMode = false;

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      bootstrap?: boolean;
    };
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
    bootstrapMode = body.bootstrap === true;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Password is required." },
      { status: 400 },
    );
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin login is not configured on the server." },
      { status: 503 },
    );
  }

  // Bootstrap mode: create first super_admin using ADMIN_PASSWORD
  if (bootstrapMode) {
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required for bootstrap." },
        { status: 400 },
      );
    }

    const adminsExist = await hasAnyAdmins();
    if (adminsExist) {
      return NextResponse.json(
        { ok: false, error: "Bootstrap is only available when no admin accounts exist." },
        { status: 403 },
      );
    }

    const isValidBootstrap = await checkBootstrapAdmin(password);
    if (!isValidBootstrap) {
      return NextResponse.json(
        { ok: false, error: "Invalid bootstrap password or bootstrap is disabled." },
        { status: 401 },
      );
    }

    // Use atomic bootstrap function with advisory lock
    const result = await bootstrapFirstAdmin(email, "Super Administrator", password);

    if ("error" in result) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 },
      );
    }

    // Sign them in immediately
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = signAdminSession({
      userId: result.id,
      email,
      role: "super_admin",
      exp,
    });

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Could not create session." },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ ok: true, bootstrap: true });
    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  }

  // Regular admin login
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const admin = await authenticateAdmin(email, password);
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signAdminSession({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    exp,
  });

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Could not create session." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
