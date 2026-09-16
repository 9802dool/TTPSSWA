import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/password-hash";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** P1001/P1000: server unreachable or credentials rejected. */
function isUnreachableDatabase(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P1000" || error.code === "P1001"))
  );
}

function isUniqueConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        message:
          "Account database is not configured. Missing DATABASE_URL in environment.",
      },
      { status: 500 },
    );
  }

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
    return NextResponse.json(
      { message: "All fields are required." },
      { status: 400 },
    );
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

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { serviceNumber }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email or service number already exists." },
        { status: 409 },
      );
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        serviceNumber,
        passwordHash: hashPassword(password),
        role: "UNVERIFIED",
      },
    });

    return NextResponse.json(
      { ok: true, message: "Account created successfully.", userId: newUser.id },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueConflict(error)) {
      return NextResponse.json(
        { message: "An account with this email or service number already exists." },
        { status: 409 },
      );
    }
    if (isUnreachableDatabase(error)) {
      console.error("POST /api/auth/register — database unreachable:", error);
      return NextResponse.json(
        {
          message:
            "Could not reach the account database. Check DATABASE_URL and that Postgres is running.",
        },
        { status: 503 },
      );
    }
    console.error("POST /api/auth/register:", error);
    return NextResponse.json(
      { message: "Failed to register account." },
      { status: 500 },
    );
  }
}
