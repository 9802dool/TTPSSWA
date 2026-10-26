import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";
import type { DentalOpticalGrantData } from "@/lib/supabase/types";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

function optionalDigits(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/\D/g, "");
}

const MAX_DOCUMENT_BYTES = 800 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

function documentExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
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
  const email = String(formData.get("email") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalDigits(formData.get("phoneHome"));
  const phoneWork = optionalDigits(formData.get("phoneWork"));
  const phone = optionalDigits(formData.get("phone"));
  const memberCategory = String(formData.get("memberCategory") ?? "").trim();
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const grantTypes = formData
    .getAll("grantType")
    .map((value) => String(value).trim())
    .filter((value) => value === "dental" || value === "optical");
  const previousGrant = String(formData.get("previousGrant") ?? "").trim();
  const documentsList = String(formData.get("documentsList") ?? "").trim();
  const declarationAccurate = String(formData.get("declarationAccurate") ?? "").trim();
  const electronicSignature = String(formData.get("electronicSignature") ?? "").trim();
  const applicantDateSigned = String(formData.get("applicantDateSigned") ?? "").trim();

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

  const uploaded = formData.get("grantReceiptInvoiceDoc");
  if (!(uploaded instanceof Blob) || uploaded.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Please attach the original receipt and/or invoice." },
      { status: 400 },
    );
  }
  const fileName =
    uploaded instanceof File && uploaded.name ? uploaded.name : "receipt-invoice.bin";
  if (uploaded.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { ok: false, error: "The receipt or invoice must be 800 KB or smaller." },
      { status: 400 },
    );
  }
  const allowed =
    ALLOWED_DOCUMENT_TYPES.has(uploaded.type) ||
    ["pdf", "jpg", "jpeg", "png"].includes(documentExtension(fileName));
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "The receipt or invoice must be a PDF, JPG, or PNG file." },
      { status: 400 },
    );
  }

  let applicationId: string | null = null;

  // Save to Supabase if configured
  if (isSupabaseConfigured()) {
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

    if (memberResult) {
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

      if (appResult) {
        applicationId = appResult.application_id;

        // Upload document
        await uploadApplicationDocument({
          application_id: applicationId,
          member_id: memberResult.member_id,
          document_type: 'receipt_invoice',
          file: uploaded,
          file_name: fileName,
          mime_type: uploaded.type || 'application/octet-stream',
        });
      }
    }
  }

  // Also save to Redis for backward compatibility (analytics)
  const redisId = await recordServiceRequest("dental_optical_grant", {
    regimentalNumber,
    rank,
    fullName,
    departmentDivision,
    sectionStation,
    memberCategory,
    address,
    email,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    age,
    sex,
    grantType,
    grantAppliedFor,
    previousGrant: previousGrant || undefined,
    documentsList,
    applicantDateSigned,
    form: "dental_optical_grant_online",
  });

  if (!applicationId && !redisId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not save your application. Ensure Supabase or Redis (Upstash) is configured.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id: applicationId || redisId });
}
