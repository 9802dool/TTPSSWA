import { NextResponse } from "next/server";
import {
  MAX_PHOTO_BYTES_FOR_STORAGE,
  recordPendingMemberSignup,
} from "@/lib/member-signup-storage";
import { hashPassword } from "@/lib/password-hash";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;

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
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const financialMember = String(formData.get("financialMember") ?? "").trim();
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
    !address ||
    !email ||
    !phone
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (financialMember !== "yes" && financialMember !== "no") {
    return NextResponse.json(
      { ok: false, error: "Please select Yes or No for financial member." },
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
    phone,
    financialMember: financialMember as "yes" | "no",
    photoMimeType: type,
    photoBase64,
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

  return NextResponse.json({ ok: true });
}
