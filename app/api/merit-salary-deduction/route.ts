import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  uploadApplicationDocument,
  deleteApplicationAndDocuments,
} from "@/lib/supabase/applications";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification } from "@/lib/email-notifications";
import { MAX_UPLOAD_TOTAL_BYTES, UPLOAD_TOO_LARGE_MESSAGE, totalUploadBytes } from "@/lib/upload-limits";
import { validateFile, getExtensionForMimeType } from "@/lib/file-validation";

export const runtime = "nodejs";

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
  if (totalUploadBytes(formData) > MAX_UPLOAD_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: UPLOAD_TOO_LARGE_MESSAGE }, { status: 413 });
  }

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

  // Turnstile verification (reject if configured and token is missing or invalid)
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

  // Validate file type and size with magic byte checking
  const validation = await validateFile(uploaded);
  if (!validation.valid) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
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


  const appResult = await createApplication({
    member_id: memberResult.member_id,
    application_type: 'merit_salary_deduction',
    application_data: applicationData,
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

  // Upload document with validated type
  const fileExtension = getExtensionForMimeType(validation.mimeType);
  const fileName = uploaded instanceof File && uploaded.name ? uploaded.name : `signed-salary-deduction${fileExtension}`;
  const uploadResult = await uploadApplicationDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'signed_salary_deduction_form',
    file: uploaded,
    file_name: fileName,
    mime_type: validation.mimeType,
  });

  if (!uploadResult) {
    console.error('Failed to upload signed salary deduction form for application', appResult.application_id);

    await deleteApplicationAndDocuments(appResult.application_id);
    return NextResponse.json(
      { ok: false, error: "Failed to upload document. Please try again." },
      { status: 500 },
    );
  }

  // Notify admins. This form collects no applicant email (the member record uses a
  // placeholder address), so no applicant confirmation is sent.
  await sendAdminNotification({
    applicationType: 'merit_salary_deduction',
    applicantName: fullName,
    applicantEmail: '(not provided)',
    applicantServiceNumber: regimentalNumber,
    applicationId: appResult.application_id,
  });

  return NextResponse.json({ ok: true, id: appResult.application_id });
}
