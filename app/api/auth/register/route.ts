import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password-hash";
import { createWebAccount } from "@/lib/web-account-storage";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: {
    fullName?: unknown;
    email?: unknown;
    serviceNumber?: unknown;
    password?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const serviceNumber =
    typeof body.serviceNumber === "string" ? body.serviceNumber.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!fullName || !email || !serviceNumber || !password) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { message: "Enter a valid work email address." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (password.length > 128) {
    return NextResponse.json({ message: "Password is too long." }, { status: 400 });
  }

  const result = await createWebAccount({
    fullName,
    email,
    serviceNumber,
    passwordHash: hashPassword(password),
  });

  if (!result.ok && result.reason === "duplicate") {
    return NextResponse.json(
      { message: "An account with this email or service number already exists." },
      { status: 409 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        message:
          "Account database is unavailable. Check the Upstash Redis configuration.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Account created successfully.",
      userId: result.account.id,
    },
    { status: 201 },
  );
}
