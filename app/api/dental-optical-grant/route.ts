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
  const memberCategory = String(formData.get("memberCategory") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalDigits(formData.get("phoneHome"));
  const phoneWork = optionalDigits(formData.get("phoneWork"));
  const phone = optionalDigits(formData.get("phone"));
  const grantType = String(formData.get("grantType") ?? "").trim();
  const treatmentDescription = String(formData.get("treatmentDescription") ?? "").trim();
  const estimatedAmountTTD = String(formData.get("estimatedAmountTTD") ?? "").trim();
  const providerName = String(formData.get("providerName") ?? "").trim();
  const quoteOrVisitDate = String(formData.get("quoteOrVisitDate") ?? "").trim();
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
    !treatmentDescription ||
    !estimatedAmountTTD ||
    !applicantDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (memberCategory !== "srp" && memberCategory !== "municipal") {
    return NextResponse.json(
      { ok: false, error: "Please select SRP or Municipal Police." },
      { status: 400 },
    );
  }

  if (grantType !== "dental" && grantType !== "optical" && grantType !== "both") {
    return NextResponse.json(
      { ok: false, error: "Please select a grant type." },
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

  const id = await recordServiceRequest("dental_optical_grant", {
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
    grantType,
    treatmentDescription,
    estimatedAmountTTD,
    providerName: providerName || undefined,
    quoteOrVisitDate: quoteOrVisitDate || undefined,
    applicantDateSigned,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
    form: "dental_optical_grant_online",
  });

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not save your application. Ensure Redis (Upstash) is configured for the site.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
