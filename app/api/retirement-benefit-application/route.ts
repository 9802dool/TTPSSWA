import { NextResponse } from "next/server";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";

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
  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const dateOfApplication = String(formData.get("dateOfApplication") ?? "").trim();
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
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const guardianLifeHealthPlan = String(formData.get("guardianLifeHealthPlan") ?? "").trim();
  const effectiveRetirementDate = String(formData.get("effectiveRetirementDate") ?? "").trim();
  const departmentalOrderReference = String(formData.get("departmentalOrderReference") ?? "").trim();
  const declarationAccurate = String(formData.get("declarationAccurate") ?? "").trim();
  const electronicSignature = String(formData.get("electronicSignature") ?? "").trim();
  const applicantDateSigned = String(formData.get("applicantDateSigned") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const witnessDate = String(formData.get("witnessDate") ?? "").trim();

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

  const uploaded = formData.get("departmentalOrderDocument");
  if (!(uploaded instanceof Blob) || uploaded.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Please attach a copy of the departmental order or retirement letter." },
      { status: 400 },
    );
  }
  const fileName =
    uploaded instanceof File && uploaded.name ? uploaded.name : "departmental-order.bin";
  if (uploaded.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { ok: false, error: "The departmental order or retirement letter must be 800 KB or smaller." },
      { status: 400 },
    );
  }
  const allowed =
    ALLOWED_DOCUMENT_TYPES.has(uploaded.type) ||
    ["pdf", "jpg", "jpeg", "png"].includes(documentExtension(fileName));
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "The departmental order or retirement letter must be a PDF, JPG, or PNG file." },
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

  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'retirement_benefit_application',
    application_data: {
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
    },
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

  // Upload document
  await uploadApplicationDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'departmental_order',
    file: uploaded,
    file_name: fileName,
    mime_type: uploaded.type || 'application/octet-stream',
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
