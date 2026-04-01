import { NextResponse } from "next/server";
import {
  MAX_PHOTO_BYTES_FOR_STORAGE,
  recordPendingMemberSignup,
} from "@/lib/member-signup-storage";
import { notifyMembershipApplicationPending } from "@/lib/member-application-notify";
import { hashPassword } from "@/lib/password-hash";
import { isAllowedMembershipPhoneCountryCode } from "@/lib/phone-country-codes";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;

function optionalLocalPhone(s: unknown): string {
  const t = String(s ?? "").trim();
  if (!t) return "";
  const digits = t.replace(/\D/g, "");
  return digits;
}

function validateOptionalPhoneDigits(digits: string, label: string): string | null {
  if (!digits) return null;
  if (digits.length < 6 || digits.length > 15) {
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

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const departmentDivision = String(formData.get("departmentDivision") ?? "").trim();
  const sectionStation = String(formData.get("sectionStation") ?? "").trim();
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const dateOfEnlistment = String(formData.get("dateOfEnlistment") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = optionalLocalPhone(formData.get("phoneHome"));
  const phoneWork = optionalLocalPhone(formData.get("phoneWork"));
  const phone = optionalLocalPhone(formData.get("phone"));
  const financialMember = String(formData.get("financialMember") ?? "").trim();
  const declarationMembership = String(formData.get("declarationMembership") ?? "").trim();
  const beneficiaryRegimentalNumber = String(
    formData.get("beneficiaryRegimentalNumber") ?? "",
  ).trim();
  const beneficiaryRank = String(formData.get("beneficiaryRank") ?? "").trim();
  const beneficiaryFullName = String(formData.get("beneficiaryFullName") ?? "").trim();
  const beneficiaryRelationship = String(
    formData.get("beneficiaryRelationship") ?? "",
  ).trim();
  const beneficiaryIdNumber = String(formData.get("beneficiaryIdNumber") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const applicationDateSigned = String(formData.get("applicationDateSigned") ?? "").trim();
  const photo = formData.get("facialPhoto");

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Username must be 3–32 characters (letters, numbers, dot, underscore, or hyphen only).",
      },
      { status: 400 },
    );
  }

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { ok: false, error: "Password must be between 8 and 128 characters." },
      { status: 400 },
    );
  }

  if (
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !departmentDivision ||
    !sectionStation ||
    !age ||
    !address ||
    !email ||
    !phoneCountryCode ||
    !dateOfBirth ||
    !dateOfEnlistment ||
    !applicationDateSigned
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

  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "Please enter your cell phone number." },
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

  if (!isAllowedMembershipPhoneCountryCode(phoneCountryCode)) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid country code." },
      { status: 400 },
    );
  }

  if (phone.length < 6 || phone.length > 15) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Enter your cell number (6–15 digits) without the country code.",
      },
      { status: 400 },
    );
  }

  if (financialMember !== "yes" && financialMember !== "no") {
    return NextResponse.json(
      { ok: false, error: "Please select Yes or No for financial member." },
      { status: 400 },
    );
  }

  if (declarationMembership !== "yes") {
    return NextResponse.json(
      {
        ok: false,
        error: "You must confirm the membership application and salary deduction statement.",
      },
      { status: 400 },
    );
  }

  if (
    !beneficiaryFullName ||
    !beneficiaryRelationship ||
    !beneficiaryIdNumber
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please complete the beneficiary nomination (name, relationship, and ID).",
      },
      { status: 400 },
    );
  }

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Please upload a facial photo." },
      { status: 400 },
    );
  }

  const type = photo.type;
  if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
    return NextResponse.json(
      { ok: false, error: "Photo must be JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (photo.size > MAX_PHOTO_BYTES_FOR_STORAGE) {
    const kb = Math.round(MAX_PHOTO_BYTES_FOR_STORAGE / 1024);
    return NextResponse.json(
      {
        ok: false,
        error: `Photo must be ${kb} KB or smaller so it can be queued for admin review.`,
      },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await photo.arrayBuffer());
  const photoBase64 = buf.toString("base64");
  const passwordHash = hashPassword(password);

  const stored = await recordPendingMemberSignup({
    username,
    passwordHash,
    regimentalNumber,
    rank,
    fullName,
    address,
    email,
    phoneCountryCode,
    phone,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    financialMember: financialMember as "yes" | "no",
    photoMimeType: type,
    photoBase64,
    departmentDivision,
    sectionStation,
    age,
    sex: sex as "male" | "female",
    dateOfBirth,
    dateOfEnlistment,
    declarationAccepted: true,
    beneficiaryRegimentalNumber: beneficiaryRegimentalNumber || undefined,
    beneficiaryRank: beneficiaryRank || undefined,
    beneficiaryFullName,
    beneficiaryRelationship,
    beneficiaryIdNumber,
    witnessName: witnessName || undefined,
    applicationDateSigned,
  });

  if (!stored) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Signup storage is not configured. Add Upstash Redis (same as analytics) or try again later.",
      },
      { status: 503 },
    );
  }

  void notifyMembershipApplicationPending({
    fullName,
    email,
    username,
    regimentalNumber,
    phoneCountryCode,
    phone,
  });

  return NextResponse.json({ ok: true });
}
