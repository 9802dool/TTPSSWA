import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { notifyMembershipApplicationPending } from "@/lib/member-application-notify";
import { hashPassword } from "@/lib/password-hash";
import {
  MAX_PHOTO_BYTES_FOR_STORAGE,
  recordPendingMemberSignup,
} from "@/lib/member-signup-storage";

export const runtime = "nodejs";

const PLACEHOLDER_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Mobile app: minimal JSON application (full PDF form still on /login). */
async function handleJson(request: Request) {
  let body: { fullName?: string; email?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!fullName || !email || !phone) {
    return NextResponse.json(
      { error: "Full name, email, and phone are required." },
      { status: 400 },
    );
  }
  const username = (email.split("@")[0] ?? `user${Date.now()}`).slice(0, 32).replace(/[^a-zA-Z0-9._-]/g, "_") || `user${Date.now()}`;
  const gate = `mobile-pending:${randomUUID()}`;
  const ok = await recordPendingMemberSignup({
    username,
    passwordHash: hashPassword(gate),
    regimentalNumber: "—",
    rank: "—",
    fullName,
    address: "Submitted via TTPSSWA mobile app — complete full application on the website if requested.",
    email,
    phone,
    phoneCountryCode: "+1868",
    financialMember: "yes",
    photoMimeType: "image/gif",
    photoBase64: PLACEHOLDER_GIF_BASE64,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Could not save application. Storage may be unavailable." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function handleMultipart(request: Request) {
  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const departmentDivision = String(formData.get("departmentDivision") ?? "").trim();
  const sectionStation = String(formData.get("sectionStation") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") ?? "").trim();
  const phoneHome = String(formData.get("phoneHome") ?? "").replace(/\D/g, "");
  const phoneWork = String(formData.get("phoneWork") ?? "").replace(/\D/g, "");
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const age = String(formData.get("age") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const dateOfEnlistment = String(formData.get("dateOfEnlistment") ?? "").trim();
  const financialMember = String(formData.get("financialMember") ?? "").trim();
  const declaration = String(formData.get("declarationMembership") ?? "").trim();
  const applicationDateSigned = String(formData.get("applicationDateSigned") ?? "").trim();

  if (
    !username ||
    password.length < 8 ||
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !departmentDivision ||
    !sectionStation ||
    !address ||
    !phoneCountryCode ||
    !phone ||
    !age ||
    (sex !== "male" && sex !== "female") ||
    !email ||
    !dateOfBirth ||
    !dateOfEnlistment ||
    (financialMember !== "yes" && financialMember !== "no") ||
    declaration !== "yes" ||
    !applicationDateSigned
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields and accept the declaration." },
      { status: 400 },
    );
  }

  const facial = formData.get("facialPhoto");
  if (!(facial instanceof Blob) || facial.size === 0) {
    return NextResponse.json({ ok: false, error: "Facial photograph is required." }, { status: 400 });
  }
  const buf = Buffer.from(await facial.arrayBuffer());
  if (buf.length > MAX_PHOTO_BYTES_FOR_STORAGE) {
    return NextResponse.json({ ok: false, error: "Photo exceeds the maximum size." }, { status: 400 });
  }
  const photoMimeType = facial.type || "image/jpeg";
  const photoBase64 = buf.toString("base64");

  const ok = await recordPendingMemberSignup({
    username,
    passwordHash: hashPassword(password),
    regimentalNumber,
    rank,
    fullName,
    address,
    email,
    phone,
    phoneCountryCode,
    phoneHome: phoneHome || undefined,
    phoneWork: phoneWork || undefined,
    financialMember: financialMember as "yes" | "no",
    photoMimeType,
    photoBase64,
    departmentDivision,
    sectionStation,
    age,
    sex: sex as "male" | "female",
    dateOfBirth,
    dateOfEnlistment,
    declarationAccepted: true,
    applicationDateSigned,
    beneficiaryRegimentalNumber: String(formData.get("beneficiaryRegimentalNumber") ?? "").trim() || undefined,
    beneficiaryRank: String(formData.get("beneficiaryRank") ?? "").trim() || undefined,
    beneficiaryFullName: String(formData.get("beneficiaryFullName") ?? "").trim() || undefined,
    beneficiaryRelationship: String(formData.get("beneficiaryRelationship") ?? "").trim() || undefined,
    beneficiaryIdNumber: String(formData.get("beneficiaryIdNumber") ?? "").trim() || undefined,
    witnessName: String(formData.get("witnessName") ?? "").trim() || undefined,
  });

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Could not save application. Storage may be unavailable." },
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

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return handleJson(request);
  }
  return handleMultipart(request);
}
