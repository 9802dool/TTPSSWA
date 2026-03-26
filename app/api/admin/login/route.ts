import { NextResponse } from "next/server";
import { getAdminCookieName, signAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || expected.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Admin login is not configured on the server." },
      { status: 503 },
    );
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password." }, { status: 401 });
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signAdminSession(exp);
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
