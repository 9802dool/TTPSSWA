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

  const documents = [
    {
      label: "Original receipt and/or invoice",
      fileName,
      mimeType: uploaded.type || "application/octet-stream",
      base64: Buffer.from(await uploaded.arrayBuffer()).toString("base64"),
    },
  ];

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
    age,
    sex,
    grantType,
    grantAppliedFor,
    previousGrant: previousGrant || undefined,
    documentsList,
    documents,
    applicantDateSigned,
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
