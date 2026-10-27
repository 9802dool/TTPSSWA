import { NextResponse } from "next/server";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  deleteApplicationAndDocuments,
} from "@/lib/supabase/applications";
import {
  verifyUploadedFile,
  moveUploadedFile,
  recordUploadedDocument,
  discardStoredFile,
} from "@/lib/supabase/direct-upload";
import type { DentalOpticalGrantData } from "@/lib/supabase/types";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification, sendApplicantConfirmation } from "@/lib/email-notifications";

export const runtime = "nodejs";

function optionalDigits(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/\D/g, "");
}

function validateOptionalPhoneDigits(digitsStr: string, label: string): string | null {
  if (!digitsStr) return null;
  if (digitsStr.length < 6 || digitsStr.length > 15) {
    return `${label} must be 6–15 digits (local number, no country code).`;
  }
  return null;
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    // Old cached pages still post multipart form data; ask them to reload.
    return NextResponse.json(
      { ok: false, error: "This form has been updated. Please refresh the page and submit again." },
      { status: 400 },
    );
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(body.website)) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = String(body.formToken ?? "").trim();
  const tokenCheck = verifyFormToken(formToken || null, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Turnstile verification (reject if configured and token is missing or invalid)
  if (isTurnstileConfigured()) {
    const turnstileToken = String(body.turnstileToken ?? "").trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken || null, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { ok: false, error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  const regimentalNumber = String(body.regimentalNumber ?? "").trim();
  const rank = String(body.rank ?? "").trim();
  const fullName = String(body.fullName ?? "").trim();
  const departmentDivision = String(body.departmentDivision ?? "").trim();
  const sectionStation = String(body.sectionStation ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phoneCountryCode = String(body.phoneCountryCode ?? "").trim();
  const phoneHome = optionalDigits(body.phoneHome);
  const phoneWork = optionalDigits(body.phoneWork);
  const phone = optionalDigits(body.phone);
  const memberCategory = String(body.memberCategory ?? "").trim();
  const age = String(body.age ?? "").trim();
  const sex = String(body.sex ?? "").trim();
  const grantTypes = Array.isArray(body.grantType)
    ? body.grantType.map((value) => String(value).trim()).filter((value) => value === "dental" || value === "optical")
    : [];
  const previousGrant = String(body.previousGrant ?? "").trim();
  const documentsList = String(body.documentsList ?? "").trim();
  const declarationAccurate = String(body.declarationAccurate ?? "").trim();
  const electronicSignature = String(body.electronicSignature ?? "").trim();
  const applicantDateSigned = String(body.applicantDateSigned ?? "").trim();

  // Document uploads (direct-to-storage)
  const uploads = Array.isArray(body.uploads) ? body.uploads : [];
  if (uploads.length !== 1) {
    return NextResponse.json(
      { ok: false, error: "Please upload the receipt/invoice document." },
      { status: 400 },
    );
  }

  if (
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !departmentDivision ||
    !sectionStation ||
    !address ||
    !email ||
    !phoneCountryCode ||
    !phone ||
    !age ||
    !documentsList ||
    !applicantDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (sex !== "male" && sex !== "female") {
    return NextResponse.json({ ok: false, error: "Please select sex." }, { status: 400 });
  }

  if (memberCategory !== "srp" && memberCategory !== "municipal") {
    return NextResponse.json(
      { ok: false, error: "Please select S.R.P. or Municipal." },
      { status: 400 },
    );
  }

  const uniqueGrantTypes = Array.from(new Set(grantTypes));
  if (uniqueGrantTypes.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Please select Dental ($1000), Optical ($1000), or both." },
      { status: 400 },
    );
  }
  const grantType =
    uniqueGrantTypes.length === 2
      ? "both"
      : uniqueGrantTypes[0] === "dental"
        ? "dental"
        : "optical";
  const grantAppliedFor = uniqueGrantTypes.map((value) =>
    value === "dental" ? "DENTAL ($1000)" : "OPTICAL ($1000)",
  );

  if (!isAllowedMembershipPhoneCountryCode(phoneCountryCode)) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid country code." },
      { status: 400 },
    );
  }

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `dental-optical:ip:${clientIP}`,
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
    `dental-optical:email:${email}`,
    RATE_LIMITS.applicationForm,
  );
  if (!emailLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions from this email. Please try again later." },
      { status: 429 },
    );
  }

  const errHome = validateOptionalPhoneDigits(phoneHome, "Home phone");
  if (errHome) {
    return NextResponse.json({ ok: false, error: errHome }, { status: 400 });
  }
  const errWork = validateOptionalPhoneDigits(phoneWork, "Work phone");
  if (errWork) {
    return NextResponse.json({ ok: false, error: errWork }, { status: 400 });
  }
  if (phone.length < 6 || phone.length > 15) {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter your cell number (6–15 digits) without the country code.",
      },
      { status: 400 },
    );
  }

  if (declarationAccurate !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error: "You must confirm that the information provided is accurate.",
      },
      { status: 400 },
    );
  }

  if (electronicSignature !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error: "You must confirm your electronic signature.",
      },
      { status: 400 },
    );
  }

  // Verify uploaded document
  const upload = uploads[0];
  if (
    typeof upload !== 'object' ||
    upload === null ||
    typeof upload.path !== 'string' ||
    typeof upload.token !== 'string' ||
    typeof upload.fileName !== 'string'
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload data." },
      { status: 400 },
    );
  }

  const uploadInfo = upload as { path: string; token: string; fileName: string };
  const verification = await verifyUploadedFile(uploadInfo.path, uploadInfo.token);
  
  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: `Document verification failed: ${verification.error}` },
      { status: 400 },
    );
  }

  // Save to Supabase
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Application storage is not configured.",
      },
      { status: 503 },
    );
  }

  // Create or update member
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
    sex: sex as 'male' | 'female',
    age: parseInt(age, 10),
  });

  if (!memberResult) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not create member record.",
      },
      { status: 500 },
    );
  }

  // Create application
  const applicationData: Record<string, unknown> = {
    regimentalNumber,
    rank,
    departmentDivision,
    sectionStation,
    memberCategory: memberCategory as 'srp' | 'municipal',
    address,
    email,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    age,
    sex: sex as 'male' | 'female',
    grantType,
    grantAppliedFor,
    previousGrant: previousGrant || undefined,
    documentsList,
    applicantDateSigned,
  };


  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'dental_optical_grant',
    application_data: applicationData,
  });

  if (!appResult) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not save application.",
      },
      { status: 500 },
    );
  }

  // Move uploaded document to final location and record metadata
  const moveResult = await moveUploadedFile(
    uploadInfo.path,
    appResult.application_id,
    uploadInfo.fileName,
  );

  if (!moveResult.ok) {
    console.error('Failed to move uploaded file:', moveResult.error);
    await deleteApplicationAndDocuments(appResult.application_id);
    return NextResponse.json(
      { ok: false, error: `Failed to process uploaded document. Please try again.` },
      { status: 500 },
    );
  }

  const recordResult = await recordUploadedDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'receipt_invoice',
    file_name: uploadInfo.fileName,
    mime_type: verification.mimeType,
    file_size: verification.size,
    storage_path: moveResult.path,
  });

  if (!recordResult) {
    console.error('Failed to record document metadata');
    await discardStoredFile(moveResult.path);
    await deleteApplicationAndDocuments(appResult.application_id);
    return NextResponse.json(
      { ok: false, error: `Failed to process uploaded document. Please try again.` },
      { status: 500 },
    );
  }

  // Send notifications (failures are logged but don't block success)
  await sendAdminNotification({
    applicationType: 'dental_optical_grant',
    applicantName: fullName,
    applicantEmail: email,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  await sendApplicantConfirmation({
    applicationType: 'dental_optical_grant',
    applicantName: fullName,
    applicantEmail: email,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
