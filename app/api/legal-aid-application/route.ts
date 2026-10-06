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

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function documentExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function isAllowedDocument(file: Blob, fileName: string): boolean {
  if (ALLOWED_DOCUMENT_TYPES.has(file.type)) return true;
  return ["pdf", "jpg", "jpeg", "png", "webp"].includes(documentExtension(fileName));
}

async function readLegalAidDocument(
  formData: FormData,
  name: string,
  label: string,
  required: boolean,
): Promise<
  | { ok: true; file: { label: string; fileName: string; mimeType: string; base64: string } | null }
  | { ok: false; error: string }
> {
  const value = formData.get(name);
  if (!(value instanceof Blob) || value.size === 0) {
    if (required) {
      return { ok: false, error: `Please upload ${label}.` };
    }
    return { ok: true, file: null };
  }
  const fileName = value instanceof File && value.name ? value.name : `${name}.bin`;
  if (value.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, error: `${label} must be 800 KB or smaller.` };
  }
  if (!isAllowedDocument(value, fileName)) {
    return { ok: false, error: `${label} must be a PDF, JPG, PNG, or WebP file.` };
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
  for (const doc of LEGAL_AID_DOCUMENTS) {
    const read = await readLegalAidDocument(formData, doc.name, doc.label, doc.required);
    if (!read.ok) {
      return NextResponse.json({ ok: false, error: read.error }, { status: 400 });
    }
    if (read.file) documents.push(read.file);
  }

  const id = await recordServiceRequest("legal_aid_application", {
    regimentalNumber,
    rank,
    fullName,
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
    documents,
    form: "legal_aid_application_online",
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
