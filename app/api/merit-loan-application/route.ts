import { NextResponse } from "next/server";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
  deleteApplicationAndDocuments,
} from "@/lib/supabase/applications";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification, sendApplicantConfirmation } from "@/lib/email-notifications";
import { MAX_UPLOAD_TOTAL_BYTES, UPLOAD_TOO_LARGE_MESSAGE, totalUploadBytes } from "@/lib/upload-limits";
import { validateFile, getExtensionForMimeType } from "@/lib/file-validation";

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

async function readMeritDocument(
  formData: FormData,
  name: string,
  label: string,
): Promise<
  | { ok: true; file: { label: string; fileName: string; mimeType: string; blob: Blob } }
  | { ok: false; error: string }
> {
  const value = formData.get(name);
  if (!(value instanceof Blob) || value.size === 0) {
    return { ok: false, error: `Please upload ${label}.` };
  }

  // Validate file type and size with magic byte checking
  const validation = await validateFile(value);
  if (!validation.valid) {
    return { ok: false, error: `${label}: ${validation.error}` };
  }

  const fileExtension = getExtensionForMimeType(validation.mimeType);
  const fileName = value instanceof File && value.name ? value.name : `${name}${fileExtension}`;
  
  return {
    ok: true,
    file: {
      label,
      fileName,
      mimeType: validation.mimeType,
      blob: value,
    },
  };
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

  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (totalUploadBytes(formData) > MAX_UPLOAD_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: UPLOAD_TOO_LARGE_MESSAGE }, { status: 413 });
  }

  if (checkHoneypot(formData.get("website"))) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = String(formData.get("formToken") ?? "").trim();
  const tokenCheck = verifyFormToken(formToken || null, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Turnstile verification (reject if configured and token is missing or invalid)
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

  const dateOfApplication = String(formData.get("dateOfApplication") ?? "").trim();
  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalDigits(formData.get("phoneHome"));
  const phoneWork = optionalDigits(formData.get("phoneWork"));
  const phone = optionalDigits(formData.get("phone"));
  const maritalStatus = String(formData.get("maritalStatus") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const age = String(formData.get("age") ?? "").trim();
  const numberOfDependents = String(formData.get("numberOfDependents") ?? "").trim();
  const employer = String(formData.get("employer") ?? "").trim();
  const divisionBranchSection = String(formData.get("divisionBranchSection") ?? "").trim();
  const employmentType = String(formData.get("employmentType") ?? "").trim();
  const yearsOfService = String(formData.get("yearsOfService") ?? "").trim();
  const amountRequestedTTD = String(formData.get("amountRequestedTTD") ?? "").trim();
  const priorMeritLoanApplied = String(formData.get("priorMeritLoanApplied") ?? "").trim();
  const purposeOfLoan = String(formData.get("purposeOfLoan") ?? "").trim();
  const currentNetSalaryTTD = String(formData.get("currentNetSalaryTTD") ?? "").trim();
  const totalSalaryDeductionsTTD = String(formData.get("totalSalaryDeductionsTTD") ?? "").trim();
  const repaymentInstallmentTTD = String(formData.get("repaymentInstallmentTTD") ?? "").trim();
  const repaymentPeriodMonths = String(formData.get("repaymentPeriodMonths") ?? "").trim();
  const declarationAccurate = String(formData.get("declarationAccurate") ?? "").trim();
  const electronicSignature = String(formData.get("electronicSignature") ?? "").trim();
  const applicantDateSigned = String(formData.get("applicantDateSigned") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const witnessDate = String(formData.get("witnessDate") ?? "").trim();
  const signatureRegimentalNumber = String(formData.get("signatureRegimentalNumber") ?? "").trim();
  const signatureRank = String(formData.get("signatureRank") ?? "").trim();

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

  const documents: {
    label: string;
    fileName: string;
    mimeType: string;
    blob: Blob;
  }[] = [];
  for (const doc of MERIT_DOCUMENTS) {
    const read = await readMeritDocument(formData, doc.name, doc.label);
    if (!read.ok) {
      return NextResponse.json({ ok: false, error: read.error }, { status: 400 });
    }
    documents.push(read.file);
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

  // Upload documents - fail if any upload fails
  for (const doc of documents) {
    const uploadResult = await uploadApplicationDocument({
      application_id: appResult.application_id,
      member_id: memberResult.member_id,
      document_type: doc.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      file: doc.blob,
      file_name: doc.fileName,
      mime_type: doc.mimeType,
    });

    if (!uploadResult) {
      console.error(`Failed to upload ${doc.label} for application`, appResult.application_id);

      await deleteApplicationAndDocuments(appResult.application_id);
      return NextResponse.json(
        { ok: false, error: `Failed to upload ${doc.label}. Please try again.` },
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
