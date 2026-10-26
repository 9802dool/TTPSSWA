import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";

export const runtime = "nodejs";

const MAX_DOCUMENT_BYTES = 800 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

function documentExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function yearFromSuffix(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 2) return `20${digits.padStart(2, "0")}`;
  return digits;
}

export async function POST(request: Request) {
  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const regimentalNumber = String(formData.get("regimentalNumber") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const divisionBranchSection = String(formData.get("divisionBranchSection") ?? "").trim();
  const workplaceAddress = String(formData.get("workplaceAddress") ?? "").trim();
  const deductionSumWords = String(formData.get("deductionSumWords") ?? "").trim();
  const deductionSumDollars = String(formData.get("deductionSumDollars") ?? "").trim();
  const startMonth = String(formData.get("startMonth") ?? "").trim();
  const startYear = yearFromSuffix(String(formData.get("startYear") ?? ""));
  const endMonth = String(formData.get("endMonth") ?? "").trim();
  const endYear = yearFromSuffix(String(formData.get("endYear") ?? ""));
  const resumeAmount = String(formData.get("resumeAmount") ?? "").trim();
  const resumeMonth = String(formData.get("resumeMonth") ?? "").trim();
  const resumeYear = yearFromSuffix(String(formData.get("resumeYear") ?? ""));
  const nameInBlockLetters = String(formData.get("nameInBlockLetters") ?? "").trim();
  const signatureRegimentalNumber = String(formData.get("signatureRegimentalNumber") ?? "").trim();
  const signatureRank = String(formData.get("signatureRank") ?? "").trim();
  const signedDate = String(formData.get("signedDate") ?? "").trim();
  const witnessName = String(formData.get("witnessName") ?? "").trim();

  if (
    !regimentalNumber ||
    !rank ||
    !fullName ||
    !address ||
    !divisionBranchSection ||
    !workplaceAddress ||
    !deductionSumWords ||
    !deductionSumDollars ||
    !startMonth ||
    !startYear ||
    !endMonth ||
    !endYear ||
    !nameInBlockLetters ||
    !signatureRegimentalNumber ||
    !signatureRank ||
    !signedDate ||
    !witnessName
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  const uploaded = formData.get("signedSalaryDeduction");
  if (!(uploaded instanceof Blob) || uploaded.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Please upload the completed and signed salary deduction form." },
      { status: 400 },
    );
  }
  const fileName = uploaded instanceof File && uploaded.name ? uploaded.name : "signed-salary-deduction.bin";
  if (uploaded.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { ok: false, error: "The signed salary deduction form must be 800 KB or smaller." },
      { status: 400 },
    );
  }
  const allowed =
    ALLOWED_DOCUMENT_TYPES.has(uploaded.type) ||
    ["pdf", "jpg", "jpeg", "png"].includes(documentExtension(fileName));
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "The signed form must be a PDF, JPG, or PNG file." },
      { status: 400 },
    );
  }

  // Save to Supabase
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Application storage is not configured.",
      },
      { status: 503 },
    );
  }

  // For merit salary deduction, we may not have full member info,
  // so create a minimal member record with what we have
  const memberResult = await upsertMember({
    email: `${regimentalNumber.replace(/\s+/g, '')}@placeholder.local`,
    full_name: fullName,
    service_number: regimentalNumber,
    rank,
    address,
  });

  if (!memberResult) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not create member record.",
      },
      { status: 500 },
    );
  }

  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'salary_deduction',
    application_data: {
      regimentalNumber,
      rank,
      address,
      divisionBranchSection,
      workplaceAddress,
      deductionSumWords,
      deductionSumDollars,
      startMonth,
      startYear,
      endMonth,
      endYear,
      resumeAmount: resumeAmount || undefined,
      resumeMonth: resumeMonth || undefined,
      resumeYear: resumeYear || undefined,
      nameInBlockLetters,
      signatureRegimentalNumber,
      signatureRank,
      signedDate,
      witnessName,
    },
  });

  if (!appResult) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not save application.",
      },
      { status: 500 },
    );
  }

  // Upload document
  await uploadApplicationDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'signed_salary_deduction_form',
    file: uploaded,
    file_name: fileName,
    mime_type: uploaded.type || 'application/octet-stream',
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
