import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUserId } from "@/lib/session-user";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  getApplications,
} from "@/lib/supabase/applications";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        message:
          "Application storage is not configured. Contact site administrator.",
      },
      { status: 500 },
    );
  }

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

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `application:ip:${clientIP}`,
    RATE_LIMITS.applicationForm,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { message: "Too many application submissions. Please try again later." },
      { status: 429 },
    );
  }

  // Rate limiting by user
  const userLimit = await checkRateLimit(
    `application:user:${sessionUserId}`,
    RATE_LIMITS.applicationForm,
  );
  if (!userLimit.success) {
    return NextResponse.json(
      { message: "Too many application submissions from this account. Please try again later." },
      { status: 429 },
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
    privacyPolicyConsent?: unknown;
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
  const privacyPolicyConsent = body.privacyPolicyConsent === true;

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

  if (!privacyPolicyConsent) {
    return NextResponse.json(
      { message: "You must accept the privacy policy to apply." },
      { status: 400 },
    );
  }

  // Upsert member from user account
  const memberResult = await upsertMember({
    email: user.email,
    full_name: user.fullName,
    service_number: user.serviceNumber,
  });

  if (!memberResult) {
    return NextResponse.json(
      { message: "Could not create member record." },
      { status: 500 },
    );
  }

  // Check for existing formal membership application
  const existing = await getApplications({
    type: 'formal_membership',
    member_id: memberResult.member_id,
    limit: 1,
  });

  if (existing.length > 0) {
    return NextResponse.json(
      { message: "A formal membership application is already on file for this account." },
      { status: 409 },
    );
  }

  // Create application
  const applicationData: Record<string, unknown> = {
    stationDivision,
    nisNumber,
    bankName,
    accountNumber,
    salaryDeductionApproved: true,
    privacyPolicyConsent: true,
  };

  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'formal_membership',
    application_data: applicationData,
  });

  if (!appResult) {
    return NextResponse.json(
      { message: "Could not submit your application." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
