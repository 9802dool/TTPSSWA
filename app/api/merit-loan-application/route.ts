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
  const documentIdCard = String(formData.get("documentIdCard") ?? "").trim();
  const documentPayslip = String(formData.get("documentPayslip") ?? "").trim();
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
    !applicantDateSigned
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

  if (employmentType !== "regular" && employmentType !== "special_reserve" && employmentType !== "contracted") {
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

  if (documentIdCard !== "yes" || documentPayslip !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Confirm that you will submit copies of ID/passport/driver permit and payslip as required.",
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

  const id = await recordServiceRequest("merit_loan_application", {
    dateOfApplication,
    regimentalNumber,
    rank,
    fullName,
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
    documentIdCard: true,
    documentPayslip: true,
    amountRequestedTTD,
    priorMeritLoanApplied,
    purposeOfLoan,
    currentNetSalaryTTD,
    totalSalaryDeductionsTTD,
    repaymentInstallmentTTD,
    repaymentPeriodMonths,
    applicantDateSigned,
    witnessName: witnessName || undefined,
    witnessDate: witnessDate || undefined,
    form: "merit_loan_application_online",
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
