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

  const dateOfApplication = String(body.dateOfApplication ?? "").trim();
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
  const age = String(body.age ?? "").trim();
  const sex = String(body.sex ?? "").trim();
  const guardianLifeHealthPlan = String(body.guardianLifeHealthPlan ?? "").trim();
  const effectiveRetirementDate = String(body.effectiveRetirementDate ?? "").trim();
  const departmentalOrderReference = String(body.departmentalOrderReference ?? "").trim();
  const declarationAccurate = String(body.declarationAccurate ?? "").trim();
  const electronicSignature = String(body.electronicSignature ?? "").trim();
  const applicantDateSigned = String(body.applicantDateSigned ?? "").trim();
  const witnessName = String(body.witnessName ?? "").trim();
  const witnessDate = String(body.witnessDate ?? "").trim();

  // Document uploads (direct-to-storage)
  const uploads = Array.isArray(body.uploads) ? body.uploads : [];
  if (uploads.length !== 1) {
    return NextResponse.json(
      { ok: false, error: "Please upload the departmental order document." },
      { status: 400 },
    );
  }

  if (
    !dateOfApplication ||
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
    !effectiveRetirementDate ||
    !departmentalOrderReference ||
    !applicantDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (sex !== "male" && sex !== "female") {
    return NextResponse.json(
      { ok: false, error: "Please select sex." },
      { status: 400 },
    );
  }

  if (guardianLifeHealthPlan !== "yes" && guardianLifeHealthPlan !== "no") {
    return NextResponse.json(
      {
        ok: false,
        error: "Please indicate if you are enrolled in the TTPSSWA Guardian Life Health Plan.",
      },
      { status: 400 },
    );
  }

  if (!isAllowedMembershipPhoneCountryCode(phoneCountryCode)) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid country code." },
      { status: 400 },
    );
  }

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `retirement-benefit:ip:${clientIP}`,
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
    `retirement-benefit:email:${email}`,
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

  // Build application data
  const applicationData: Record<string, unknown> = {
    dateOfApplication,
    regimentalNumber,
    rank,
    departmentDivision,
    sectionStation,
    address,
    email,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    age,
    sex,
    guardianLifeHealthPlan,
    effectiveRetirementDate,
    departmentalOrderReference,
    departmentalOrderCopyConfirmed: true,
    applicantDateSigned,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
  };


  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'retirement_benefit_application',
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
    document_type: 'departmental_order',
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
    applicationType: 'retirement_benefit_application',
    applicantName: fullName,
    applicantEmail: email,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  await sendApplicantConfirmation({
    applicationType: 'retirement_benefit_application',
    applicantName: fullName,
    applicantEmail: email,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
