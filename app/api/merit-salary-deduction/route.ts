import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  upsertMember,
  createApplication,
  deleteApplicationAndDocuments,
} from "@/lib/supabase/applications";
import {
  verifyUploadedFile,
  moveUploadedFile,
  recordUploadedDocument,
} from "@/lib/supabase/direct-upload";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminNotification } from "@/lib/email-notifications";

export const runtime = "nodejs";

function yearFromSuffix(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 2) return `20${digits.padStart(2, "0")}`;
  return digits;
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(body.website)) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = String(body.formToken ?? "").trim();
  const tokenCheck = verifyFormToken(formToken || null, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true, id: "spam-rejected" });
  }

  // Turnstile verification (reject if configured and token is missing or invalid)
  if (isTurnstileConfigured()) {
    const turnstileToken = String(body.turnstileToken ?? "").trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken || null, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { ok: false, error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  const regimentalNumber = String(body.regimentalNumber ?? "").trim();
  const rank = String(body.rank ?? "").trim();
  const fullName = String(body.fullName ?? "").trim();
  const address = String(body.address ?? "").trim();
  const divisionBranchSection = String(body.divisionBranchSection ?? "").trim();
  const workplaceAddress = String(body.workplaceAddress ?? "").trim();
  const deductionSumWords = String(body.deductionSumWords ?? "").trim();
  const deductionSumDollars = String(body.deductionSumDollars ?? "").trim();
  const startMonth = String(body.startMonth ?? "").trim();
  const startYear = yearFromSuffix(String(body.startYear ?? ""));
  const endMonth = String(body.endMonth ?? "").trim();
  const endYear = yearFromSuffix(String(body.endYear ?? ""));
  const resumeAmount = String(body.resumeAmount ?? "").trim();
  const resumeMonth = String(body.resumeMonth ?? "").trim();
  const resumeYear = yearFromSuffix(String(body.resumeYear ?? ""));
  const nameInBlockLetters = String(body.nameInBlockLetters ?? "").trim();
  const signatureRegimentalNumber = String(body.signatureRegimentalNumber ?? "").trim();
  const signatureRank = String(body.signatureRank ?? "").trim();
  const signedDate = String(body.signedDate ?? "").trim();
  const witnessName = String(body.witnessName ?? "").trim();

  // Document uploads (direct-to-storage)
  const uploads = Array.isArray(body.uploads) ? body.uploads : [];
  if (uploads.length !== 1) {
    return NextResponse.json(
      { ok: false, error: "Please upload the signed authorization document." },
      { status: 400 },
    );
  }

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

  // Verify uploaded document
  const upload = uploads[0];
  if (
    typeof upload !== 'object' ||
    upload === null ||
    typeof upload.path !== 'string' ||
    typeof upload.token !== 'string' ||
    typeof upload.fileName !== 'string'
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload data." },
      { status: 400 },
    );
  }

  const uploadInfo = upload as { path: string; token: string; fileName: string };
  const verification = await verifyUploadedFile(uploadInfo.path, uploadInfo.token);
  
  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: `Document verification failed: ${verification.error}` },
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

  // Move uploaded document to final location and record metadata
  const moveResult = await moveUploadedFile(
    uploadInfo.path,
    appResult.application_id,
    uploadInfo.fileName,
  );

  if (!moveResult.ok) {
    console.error('Failed to move uploaded file:', moveResult.error);
    await deleteApplicationAndDocuments(appResult.application_id);
    return NextResponse.json(
      { ok: false, error: `Failed to process uploaded document. Please try again.` },
      { status: 500 },
    );
  }

  const recordResult = await recordUploadedDocument({
    application_id: appResult.application_id,
    member_id: memberResult.member_id,
    document_type: 'signed_salary_deduction_form',
    file_name: uploadInfo.fileName,
    mime_type: verification.mimeType,
    file_size: verification.size,
    storage_path: moveResult.path,
  });

  if (!recordResult) {
    console.error('Failed to record document metadata');
    await deleteApplicationAndDocuments(appResult.application_id);
    return NextResponse.json(
      { ok: false, error: `Failed to process uploaded document. Please try again.` },
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
