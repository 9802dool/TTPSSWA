import { NextResponse } from "next/server";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification, sendApplicantConfirmation } from "@/lib/email-notifications";
import { validateFile, getExtensionForMimeType } from "@/lib/file-validation";

export const runtime = "nodejs";

function optionalDigits(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/\D/g, "");
}

const LEGAL_AID_DOCUMENTS = [
  { name: "reportFromApplicant", label: "Report from Applicant", required: true },
  { name: "copyOfCharges", label: "Copy of Charge(s)", required: true },
  { name: "warningNotices", label: "Warning Notice(s)", required: true },
  { name: "requisitionFromAttorney", label: "Requisition from Attorney", required: true },
  {
    name: "incidentPhotos",
    label: "Photos of Incident (Where applicable)",
    required: false,
  },
] as const;

async function readLegalAidDocument(
  formData: FormData,
  name: string,
  label: string,
  required: boolean,
): Promise<
  | { ok: true; file: { label: string; fileName: string; mimeType: string; blob: Blob } | null }
  | { ok: false; error: string }
> {
  const value = formData.get(name);
  if (!(value instanceof Blob) || value.size === 0) {
    if (required) {
      return { ok: false, error: `Please upload ${label}.` };
    }
    return { ok: true, file: null };
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

  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const departmentDivision = String(formData.get("departmentDivision") ?? "").trim();
  const sectionStation = String(formData.get("sectionStation") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalDigits(formData.get("phoneHome"));
  const phoneWork = optionalDigits(formData.get("phoneWork"));
  const phone = optionalDigits(formData.get("phone"));
  const matterType = String(formData.get("matterType") ?? "").trim();
  const matterDescription = String(formData.get("matterDescription") ?? "").trim();
  const courtOrUnit = String(formData.get("courtOrUnit") ?? "").trim();
  const matterReference = String(formData.get("matterReference") ?? "").trim();
  const dateReported = String(formData.get("dateReported") ?? "").trim();
  const declarationAccurate = String(formData.get("declarationAccurate") ?? "").trim();
  const electronicSignature = String(formData.get("electronicSignature") ?? "").trim();
  const applicantDateSigned = String(formData.get("applicantDateSigned") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const witnessDate = String(formData.get("witnessDate") ?? "").trim();

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
    !matterDescription ||
    !applicantDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (
    matterType !== "criminal" &&
    matterType !== "disciplinary" &&
    matterType !== "both"
  ) {
    return NextResponse.json(
      { ok: false, error: "Please select the type of matter." },
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
    `legal-aid:ip:${clientIP}`,
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
    `legal-aid:email:${email}`,
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
  for (const doc of LEGAL_AID_DOCUMENTS) {
    const read = await readLegalAidDocument(formData, doc.name, doc.label, doc.required);
    if (!read.ok) {
      return NextResponse.json({ ok: false, error: read.error }, { status: 400 });
    }
    if (read.file) documents.push(read.file);
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
    matterType,
    matterDescription,
    courtOrUnit: courtOrUnit || undefined,
    matterReference: matterReference || undefined,
    dateReported: dateReported || undefined,
    applicantDateSigned,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
  };


  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'legal_aid_application',
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

  // Upload each document - fail if any upload fails
  for (const doc of documents) {
    const uploadResult = await uploadApplicationDocument({
      application_id: appResult.application_id,
      member_id: memberResult.member_id,
      document_type: doc.label.toLowerCase().replace(/\s+/g, '_'),
      file: doc.blob,
      file_name: doc.fileName,
      mime_type: doc.mimeType,
    });

    if (!uploadResult) {
      console.error(`Failed to upload ${doc.label} for application`, appResult.application_id);
      return NextResponse.json(
        { ok: false, error: `Failed to upload ${doc.label}. Please try again.` },
        { status: 500 },
      );
    }
  }

  // Send notifications (failures are logged but don't block success)
  await sendAdminNotification({
    applicationType: 'legal_aid_application',
    applicantName: fullName,
    applicantEmail: email,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  await sendApplicantConfirmation({
    applicationType: 'legal_aid_application',
    applicantName: fullName,
    applicantEmail: email,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
