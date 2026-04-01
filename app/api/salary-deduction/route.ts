import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";

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
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const departmentDivision = String(formData.get("departmentDivision") ?? "").trim();
  const sectionStation = String(formData.get("sectionStation") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const dateOfEnlistment = String(formData.get("dateOfEnlistment") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalDigits(formData.get("phoneHome"));
  const phoneWork = optionalDigits(formData.get("phoneWork"));
  const phone = optionalDigits(formData.get("phone"));
  const commencementDate = String(formData.get("commencementDate") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const witnessDate = String(formData.get("witnessDate") ?? "").trim();
  const applicantDateSigned = String(formData.get("applicantDateSigned") ?? "").trim();
  const authMonthlyDeduction = String(formData.get("authMonthlyDeduction") ?? "").trim();
  const policyAcknowledgment = String(formData.get("policyAcknowledgment") ?? "").trim();
  const electronicSignature = String(formData.get("electronicSignature") ?? "").trim();

  if (
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !departmentDivision ||
    !sectionStation ||
    !address ||
    !email ||
    !age ||
    !dateOfBirth ||
    !dateOfEnlistment ||
    !phoneCountryCode ||
    !phone ||
    !commencementDate ||
    !applicantDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (sex !== "male" && sex !== "female") {
    return NextResponse.json(
      { ok: false, error: "Please select Male or Female." },
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

  if (authMonthlyDeduction !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error: "You must authorize the monthly salary deduction of $140.00 TTD.",
      },
      { status: 400 },
    );
  }

  if (policyAcknowledgment !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error: "You must acknowledge the cancellation policy.",
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

  const id = await recordServiceRequest("salary_deduction", {
    regimentalNumber,
    rank,
    fullName,
    departmentDivision,
    sectionStation,
    address,
    email,
    age,
    sex,
    dateOfBirth,
    dateOfEnlistment,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    phone,
    commencementDate,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
    applicantDateSigned,
    form: "salary_deduction_online",
  });

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not save your form. Ensure Redis (Upstash) is configured for the site.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
