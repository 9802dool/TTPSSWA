import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { uploadApplicationDocument } from "@/lib/supabase/applications";
import { verifyApplicationOwnership } from "@/lib/supabase/member-helpers";
import { validateFile } from "@/lib/file-validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { isEmailVerified } from "@/lib/verify-account-helper";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check email verification
  const verified = await isEmailVerified(userId);
  if (!verified) {
    return NextResponse.json({ 
      error: "Email verification required",
      requiresVerification: true,
    }, { status: 403 });
  }

  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const applicationId = formData.get('applicationId') as string | null;
  const documentType = formData.get('documentType') as string | null;

  if (!file || !applicationId || !documentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate file type and size with magic byte checking
  const validation = await validateFile(file);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Get user to verify ownership
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // Verify application belongs to this user (case-insensitive email match)
  const ownership = await verifyApplicationOwnership(applicationId, user.email);
  if (!ownership) {
    return NextResponse.json({ error: "Application not found or access denied" }, { status: 403 });
  }

  // Upload document
  const result = await uploadApplicationDocument({
    application_id: applicationId,
    member_id: ownership.member_id,
    document_type: documentType,
    file: file,
    file_name: file.name,
    mime_type: validation.mimeType, // Use validated MIME type from magic bytes
  });

  if (!result) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, documentId: result.document_id });
}
