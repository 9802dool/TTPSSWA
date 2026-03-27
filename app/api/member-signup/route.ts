import { NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const financialMember = String(formData.get("financialMember") ?? "").trim();
  const photo = formData.get("facialPhoto");

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

  if (photo.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Photo must be 5 MB or smaller." },
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

  // TODO: persist submissions (email, database, blob storage for `photo`).
  // Accepted payload validated above; photo size was `photo.size` bytes, type `{type}`.

  return NextResponse.json({ ok: true });
}
