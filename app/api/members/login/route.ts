import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findAcceptedMemberByUsernameOrEmail } from "@/lib/member-signup-storage";
import { verifyPassword } from "@/lib/password-hash";
import {
  getMemberCookieName,
  isMemberSessionConfigured,
  signMemberSession,
} from "@/lib/member-session";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export async function POST(request: Request) {
  let body: { identifier?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const identifier =
    (typeof body.identifier === "string" ? body.identifier.trim() : "") ||
    (typeof body.email === "string" ? body.email.trim() : "");
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Username or email and password are required." },
      { status: 400 },
    );
  }

  if (!isMemberSessionConfigured()) {
    return NextResponse.json(
      { error: "Member sign-in is not configured on this server." },
      { status: 503 },
    );
  }

  const member = await findAcceptedMemberByUsernameOrEmail(identifier);
  if (!member?.passwordHash || !verifyPassword(password, member.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = signMemberSession(member.id, Date.now() + COOKIE_MAX_AGE_SEC * 1000);
  if (!token) {
    return NextResponse.json({ error: "Could not create session." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getMemberCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}
