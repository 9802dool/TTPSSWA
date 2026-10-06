import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";

export const runtime = "nodejs";

function optionalDigits(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/\D/g, "");
}

const MAX_DOCUMENT_BYTES = 800 * 1024;

const MERIT_DOCUMENTS = [
  { name: "idDocument", label: "ID card / passport / driver's permit" },
  { name: "payslipDocument", label: "Payslip" },
] as const;

const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

function documentExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function isAllowedDocument(file: Blob, fileName: string): boolean {
  if (ALLOWED_DOCUMENT_TYPES.has(file.type)) return true;
  return ["pdf", "jpg", "jpeg", "png"].includes(documentExtension(fileName));
}

async function readMeritDocument(
  formData: FormData,
  name: string,
  label: string,
): Promise<
  | { ok: true; file: { label: string; fileName: string; mimeType: string; base64: string } }
  | { ok: false; error: string }
> {
  const value = formData.get(name);
  if (!(value instanceof Blob) || value.size === 0) {
    return { ok: false, error: `Please upload ${label}.` };
  }
  const fileName = value instanceof File && value.name ? value.name : `${name}.bin`;
  if (value.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, error: `${label} must be 800 KB or smaller.` };
  }
  if (!isAllowedDocument(value, fileName)) {
    return { ok: false, error: `${label} must be a PDF, JPG, or PNG file.` };
  }
  const base64 = Buffer.from(await value.arrayBuffer()).toString("base64");
  return {
    ok: true,
    file: {
      label,
      fileName,
      mimeType: value.type || "application/octet-stream",
      base64,
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
  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
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
    base64: string;
  }[] = [];
  for (const doc of MERIT_DOCUMENTS) {
    const read = await readMeritDocument(formData, doc.name, doc.label);
    if (!read.ok) {
      return NextResponse.json({ ok: false, error: read.error }, { status: 400 });
    }
    documents.push(read.file);
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
    signatureRegimentalNumber,
    signatureRank,
    documents,
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
