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
  matchDocumentUploads,
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

const MERIT_DOCUMENTS = [
  { name: "idDocument", label: "ID card / passport / driver's permit" },
  { name: "payslipDocument", label: "Payslip" },
] as const;

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
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phoneCountryCode = String(body.phoneCountryCode ?? "").trim();
  const phoneHome = optionalDigits(body.phoneHome);
  const phoneWork = optionalDigits(body.phoneWork);
  const phone = optionalDigits(body.phone);
  const maritalStatus = String(body.maritalStatus ?? "").trim();
  const dateOfBirth = String(body.dateOfBirth ?? "").trim();
  const age = String(body.age ?? "").trim();
  const numberOfDependents = String(body.numberOfDependents ?? "").trim();
  const employer = String(body.employer ?? "").trim();
  const divisionBranchSection = String(body.divisionBranchSection ?? "").trim();
  const employmentType = String(body.employmentType ?? "").trim();
  const yearsOfService = String(body.yearsOfService ?? "").trim();
  const amountRequestedTTD = String(body.amountRequestedTTD ?? "").trim();
  const priorMeritLoanApplied = String(body.priorMeritLoanApplied ?? "").trim();
  const purposeOfLoan = String(body.purposeOfLoan ?? "").trim();
  const currentNetSalaryTTD = String(body.currentNetSalaryTTD ?? "").trim();
  const totalSalaryDeductionsTTD = String(body.totalSalaryDeductionsTTD ?? "").trim();
  const repaymentInstallmentTTD = String(body.repaymentInstallmentTTD ?? "").trim();
  const repaymentPeriodMonths = String(body.repaymentPeriodMonths ?? "").trim();
  const declarationAccurate = String(body.declarationAccurate ?? "").trim();
  const electronicSignature = String(body.electronicSignature ?? "").trim();
  const applicantDateSigned = String(body.applicantDateSigned ?? "").trim();
  const witnessName = String(body.witnessName ?? "").trim();
  const witnessDate = String(body.witnessDate ?? "").trim();
  const signatureRegimentalNumber = String(body.signatureRegimentalNumber ?? "").trim();
  const signatureRank = String(body.signatureRank ?? "").trim();

  // Document uploads (direct-to-storage)
  const uploads = Array.isArray(body.uploads) ? body.uploads : [];
  if (uploads.length !== MERIT_DOCUMENTS.length) {
    return NextResponse.json(
      { ok: false, error: "Please upload all required documents." },
      { status: 400 },
    );
  }

  if (
    !dateOfApplication ||
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !address ||
    !email ||
    !phoneCountryCode ||
    !phone ||
    !dateOfBirth ||
    !age ||
    numberOfDependents === "" ||
    !employer ||
    !divisionBranchSection ||
    !yearsOfService ||
    !amountRequestedTTD ||
    !purposeOfLoan ||
    !currentNetSalaryTTD ||
    !totalSalaryDeductionsTTD ||
    !repaymentInstallmentTTD ||
    !repaymentPeriodMonths ||
    !applicantDateSigned ||
    !signatureRegimentalNumber ||
    !signatureRank
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  const validMarital = new Set([
    "single",
    "married",
    "civil_union",
    "separated",
    "widowed",
    "divorced",
  ]);
  if (!validMarital.has(maritalStatus)) {
    return NextResponse.json(
      { ok: false, error: "Please select marital status." },
      { status: 400 },
    );
  }

  if (
    employmentType !== "regular" &&
    employmentType !== "special_reserve" &&
    employmentType !== "municipal" &&
    employmentType !== "contracted"
  ) {
    return NextResponse.json(
      { ok: false, error: "Please select employment type." },
      { status: 400 },
    );
  }

  if (priorMeritLoanApplied !== "yes" && priorMeritLoanApplied !== "no") {
    return NextResponse.json(
      { ok: false, error: "Please indicate if you have applied for a merit loan before." },
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
    `merit-loan:ip:${clientIP}`,
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
    `merit-loan:email:${email}`,
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

  // Verify uploaded documents
  interface UploadInfo {
    path: string;
    token: string;
    fileName: string;
    documentType: string;
  }

  const verifiedUploads: Array<{
    path: string;
    fileName: string;
    mimeType: string;
    size: number;
    documentType: string;
  }> = [];

  const matched = matchDocumentUploads(uploads, MERIT_DOCUMENTS);
  if (!matched.ok) {
    return NextResponse.json({ ok: false, error: matched.error }, { status: 400 });
  }

  for (const upload of matched.uploads) {
    if (
      typeof upload !== 'object' ||
      upload === null ||
      typeof upload.path !== 'string' ||
      typeof upload.token !== 'string' ||
      typeof upload.fileName !== 'string' ||
      typeof upload.documentType !== 'string'
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid upload data." },
        { status: 400 },
      );
    }

    const uploadInfo = upload as UploadInfo;
    const verification = await verifyUploadedFile(uploadInfo.path, uploadInfo.token);
    
    if (!verification.ok) {
      return NextResponse.json(
        { ok: false, error: `Document verification failed: ${verification.error}` },
        { status: 400 },
      );
    }

    verifiedUploads.push({
      path: uploadInfo.path,
      fileName: uploadInfo.fileName,
      mimeType: verification.mimeType,
      size: verification.size,
      documentType: upload.label,
    });
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
    date_of_birth: dateOfBirth,
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
    fullName,
    dateOfApplication,
    regimentalNumber,
    rank,
    address,
    email,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    maritalStatus,
    dateOfBirth,
    age,
    numberOfDependents,
    employer,
    divisionBranchSection,
    employmentType,
    yearsOfService,
    amountRequestedTTD,
    priorMeritLoanApplied,
    purposeOfLoan,
    currentNetSalaryTTD,
    totalSalaryDeductionsTTD,
    repaymentInstallmentTTD,
    repaymentPeriodMonths,
    applicantDateSigned,
    signatureRegimentalNumber,
    signatureRank,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
  };


  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'merit_loan_application',
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

  // Move uploaded documents to final location and record metadata
  for (const upload of verifiedUploads) {
    // Move from pending/ to application folder
    const moveResult = await moveUploadedFile(
      upload.path,
      appResult.application_id,
      upload.fileName,
    );

    if (!moveResult.ok) {
      console.error('Failed to move uploaded file:', moveResult.error);
      await deleteApplicationAndDocuments(appResult.application_id);
      return NextResponse.json(
        { ok: false, error: `Failed to process uploaded documents. Please try again.` },
        { status: 500 },
      );
    }

    // Record document metadata
    const recordResult = await recordUploadedDocument({
      application_id: appResult.application_id,
      member_id: memberResult.member_id,
      document_type: upload.documentType.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      file_name: upload.fileName,
      mime_type: upload.mimeType,
      file_size: upload.size,
      storage_path: moveResult.path,
    });

    if (!recordResult) {
      console.error('Failed to record document metadata');
      await discardStoredFile(moveResult.path);
      await deleteApplicationAndDocuments(appResult.application_id);
      return NextResponse.json(
        { ok: false, error: `Failed to process uploaded documents. Please try again.` },
        { status: 500 },
      );
    }
  }

  // Send notifications (failures are logged but don't block success)
  await sendAdminNotification({
    applicationType: 'merit_loan_application',
    applicantName: fullName,
    applicantEmail: email,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  await sendApplicantConfirmation({
    applicationType: 'merit_loan_application',
    applicantName: fullName,
    applicantEmail: email,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
