import { NextResponse } from "next/server";
import { findPendingMemberByUsernameOrEmail } from "@/lib/member-signup-storage";
import {
  getMemberCookieName,
  isMemberSessionConfigured,
  signMemberSession,
} from "@/lib/member-session";
import { verifyPassword } from "@/lib/password-hash";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let identifier = "";
  let password = "";
  try {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
    };
    identifier = typeof body.identifier === "string" ? body.identifier : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  identifier = identifier.trim();
  if (!identifier || !password) {
    return NextResponse.json(
      { ok: false, error: "Enter your username or email and password." },
      { status: 400 },
    );
  }

  if (!isMemberSessionConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Member login is not configured. Set ADMIN_PASSWORD (8+ chars) or MEMBER_SESSION_SECRET on the server.",
      },
      { status: 503 },
    );
  }

  const member = await findPendingMemberByUsernameOrEmail(identifier);
  if (!member || !member.passwordHash) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password." },
      { status: 401 },
    );
  }

  if (!verifyPassword(password, member.passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const sessionToken = signMemberSession(member.id, exp);
  if (!sessionToken) {
    return NextResponse.json(
      { ok: false, error: "Could not create session." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getMemberCookieName(), sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
