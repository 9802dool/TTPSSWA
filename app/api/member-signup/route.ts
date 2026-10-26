import { NextResponse } from "next/server";
import { notifyMembershipApplicationPending } from "@/lib/member-application-notify";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification } from "@/lib/email-notifications";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

const PLACEHOLDER_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Mobile app: minimal JSON application without a website login. */
async function handleJson(request: Request) {
  let body: { fullName?: string; email?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!fullName || !email || !phone) {
    return NextResponse.json(
      { error: "Full name, email, and phone are required." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application storage is not configured." },
      { status: 503 },
    );
  }

  // Create minimal member application from mobile app
  const memberResult = await upsertMember({
    email,
    full_name: fullName,
    phone,
    phone_country_code: "+1868",
    service_number: "—",
    rank: "—",
    address: "Submitted via TTPSSWA mobile app — complete full application on the website if requested.",
    financial_member: "yes",
  });

  if (!memberResult) {
    return NextResponse.json(
      { error: "Could not create member record." },
      { status: 500 },
    );
  }

  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'membership_signup',
    application_data: {
      regimentalNumber: "—",
      rank: "—",
      phone,
      phoneCountryCode: "+1868",
      financialMember: "yes",
      source: "mobile_app",
    },
  });

  if (!appResult) {
    return NextResponse.json(
      { error: "Could not save application." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

async function handleMultipart(request: Request) {
  const clientIP = getClientIP(request);

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Application storage is not configured." },
      { status: 503 },
    );
  }

  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(formData.get("website"))) {
    return NextResponse.json({ ok: true });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = String(formData.get("formToken") ?? "").trim();
  const tokenCheck = verifyFormToken(formToken || null, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true });
  }

  // Turnstile verification (only if configured)
  if (isTurnstileConfigured()) {
    const turnstileToken = String(formData.get("turnstileToken") ?? "").trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken || null, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { ok: false, error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const departmentDivision = String(formData.get("departmentDivision") ?? "").trim();
  const sectionStation = String(formData.get("sectionStation") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = String(formData.get("phoneHome") ?? "").replace(/\D/g, "");
  const phoneWork = String(formData.get("phoneWork") ?? "").replace(/\D/g, "");
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const dateOfEnlistment = String(formData.get("dateOfEnlistment") ?? "").trim();
  const financialMember = String(formData.get("financialMember") ?? "").trim();
  const declaration = String(formData.get("declarationMembership") ?? "").trim();
  const applicationDateSigned = String(formData.get("applicationDateSigned") ?? "").trim();

  if (
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !departmentDivision ||
    !sectionStation ||
    !address ||
    !phoneCountryCode ||
    !phone ||
    !age ||
    (sex !== "male" && sex !== "female") ||
    !email ||
    !dateOfBirth ||
    !dateOfEnlistment ||
    (financialMember !== "yes" && financialMember !== "no") ||
    declaration !== "yes" ||
    !applicationDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields and accept the declaration." },
      { status: 400 },
    );
  }

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `member-signup:ip:${clientIP}`,
    RATE_LIMITS.applicationForm,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  // Rate limiting by email
  const emailLimit = await checkRateLimit(
    `member-signup:email:${email}`,
    RATE_LIMITS.applicationForm,
  );
  if (!emailLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions from this email. Please try again later." },
      { status: 429 },
    );
  }

  const facial = formData.get("facialPhoto");
  if (!(facial instanceof Blob) || facial.size === 0) {
    return NextResponse.json({ ok: false, error: "Facial photograph is required." }, { status: 400 });
  }
  if (facial.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ ok: false, error: "Photo must be smaller than 5 MB." }, { status: 400 });
  }

  // Create or update member record
  const memberResult = await upsertMember({
    email,
    full_name: fullName,
    service_number: regimentalNumber,
    rank,
    phone,
    phone_country_code: phoneCountryCode,
    phone_home: phoneHome || undefined,
    phone_work: phoneWork || undefined,
    address,
    department_division: departmentDivision,
    section_station: sectionStation,
    date_of_birth: dateOfBirth,
    sex: sex as 'male' | 'female',
    age: parseInt(age, 10),
    financial_member: financialMember as 'yes' | 'no',
    date_of_enlistment: dateOfEnlistment,
  });

  if (!memberResult) {
    return NextResponse.json(
      { ok: false, error: "Could not create member record." },
      { status: 500 },
    );
  }

  // Build application data
  const applicationData: Record<string, unknown> = {
    regimentalNumber,
    rank,
    departmentDivision,
    sectionStation,
    address,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    age,
    sex: sex as 'male' | 'female',
    dateOfBirth,
    dateOfEnlistment,
    financialMember: financialMember as 'yes' | 'no',
    declarationAccepted: true,
    applicationDateSigned,
    beneficiaryFullName: String(formData.get("beneficiaryFullName") ?? "").trim() || undefined,
    beneficiaryRelationship: String(formData.get("beneficiaryRelationship") ?? "").trim() || undefined,
    beneficiaryIdNumber: String(formData.get("beneficiaryIdNumber") ?? "").trim() || undefined,
    witnessName: String(formData.get("witnessName") ?? "").trim() || undefined,
  };


  // Create application
  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'membership_signup',
    application_data: applicationData,
  });

  if (!appResult) {
    return NextResponse.json(
      { ok: false, error: "Could not save application." },
      { status: 500 },
    );
  }

  // Upload facial photo
  const photoUpload = await uploadApplicationDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'facial_photo',
    file: facial,
    file_name: 'facial-photo.jpg',
    mime_type: facial.type || 'image/jpeg',
  });

  if (!photoUpload) {
    console.error('Failed to upload facial photo for application', appResult.application_id);
    // Continue anyway - application is saved
  }

  // Send admin notification
  await sendAdminNotification({
    applicationType: 'membership_signup',
    applicantName: fullName,
    applicantEmail: email,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  // Applicant confirmation (email/WhatsApp). Awaited so serverless does not cut it off;
  // failures are logged and never block the submission.
  await notifyMembershipApplicationPending({
    fullName,
    email,
    regimentalNumber,
    phoneCountryCode,
    phone,
  }).catch((error) => {
    console.error("Membership pending notification failed:", error);
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return handleJson(request);
  }
  return handleMultipart(request);
}
