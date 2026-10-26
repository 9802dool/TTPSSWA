import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
} from "@/lib/supabase/applications";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification, sendApplicantConfirmation } from "@/lib/email-notifications";

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
  const clientIP = getClientIP(request);

  const formData = (await request.formData().catch(() => null)) as globalThis.FormData | null;
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(formData.get("website"))) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = String(formData.get("formToken") ?? "").trim();
  const tokenCheck = verifyFormToken(formToken || null, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Turnstile verification (only if configured)
  if (isTurnstileConfigured()) {
    const turnstileToken = String(formData.get("turnstileToken") ?? "").trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken || null, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { ok: false, error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
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

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `salary-deduction:ip:${clientIP}`,
    RATE_LIMITS.applicationForm,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  // Rate limiting by regimental number
  const regNumLimit = await checkRateLimit(
    `salary-deduction:regnum:${regimentalNumber}`,
    RATE_LIMITS.applicationForm,
  );
  if (!regNumLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions from this account. Please try again later." },
      { status: 429 },
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
  const placeholderEmail = `${regimentalNumber.replace(/\s+/g, '')}@placeholder.local`;
  const memberResult = await upsertMember({
    email: placeholderEmail,
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

  // Build application data
  const applicationData: Record<string, unknown> = {
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
  };

  // If existing member, preserve submitted data
  const submittedData = memberResult.is_new ? null : applicationData;

  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'merit_salary_deduction',
    application_data: applicationData,
    submitted_data: submittedData,
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

  // Send notifications (failures are logged but don't block success)
  void sendAdminNotification({
    applicationType: 'merit_salary_deduction',
    applicantName: fullName,
    applicantEmail: placeholderEmail,
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  void sendApplicantConfirmation({
    applicationType: 'merit_salary_deduction',
    applicantName: fullName,
    applicantEmail: placeholderEmail,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
