import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session-user";

export const runtime = "nodejs";

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
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

  const sessionUserId = getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json(
      { message: "Sign in to submit a membership application." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
  if (!user) {
    return NextResponse.json(
      { message: "Sign in with the web account you created to apply." },
      { status: 401 },
    );
  }

  let body: {
    userId?: unknown;
    stationDivision?: unknown;
    nisNumber?: unknown;
    bankName?: unknown;
    accountNumber?: unknown;
    salaryDeductionApproved?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const stationDivision =
    typeof body.stationDivision === "string" ? body.stationDivision.trim() : "";
  const nisNumber = typeof body.nisNumber === "string" ? body.nisNumber.trim() : "";
  const bankName = typeof body.bankName === "string" ? body.bankName.trim() : "";
  const accountNumber =
    typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
  const salaryDeductionApproved = body.salaryDeductionApproved === true;

  if (!stationDivision || !nisNumber || !bankName || !accountNumber) {
    return NextResponse.json(
      { message: "Station, NIS number, bank name, and account number are required." },
      { status: 400 },
    );
  }

  if (!salaryDeductionApproved) {
    return NextResponse.json(
      { message: "You must consent to salary deduction to apply." },
      { status: 400 },
    );
  }

  try {
    await prisma.membershipApplication.create({
      data: {
        userId: user.id,
        stationDivision,
        nisNumber,
        bankName,
        accountNumber,
        salaryDeductionApproved: true,
        status: "PENDING",
      },
    });
  } catch (error) {
    if (isUniqueConflict(error)) {
      return NextResponse.json(
        { message: "A membership application is already on file for this account." },
        { status: 409 },
      );
    }
    console.error("POST /api/membership/apply:", error);
    return NextResponse.json(
      { message: "Could not submit your application." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
