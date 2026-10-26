import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { uploadApplicationDocument } from "@/lib/supabase/applications";
import { createServiceClient } from "@/lib/supabase/service";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File must be smaller than 5 MB" }, { status: 400 });
  }

  // Get user to verify ownership
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not available" }, { status: 503 });
  }

  // Verify application belongs to this user
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id, member_id, members!inner(email)')
    .eq('id', applicationId)
    .single();

  if (appError || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const memberEmail = (app as any).members?.email;
  if (memberEmail !== user.email) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Upload document
  const result = await uploadApplicationDocument({
    application_id: applicationId,
    member_id: (app as any).member_id,
    document_type: documentType,
    file: file,
    file_name: file.name,
    mime_type: file.type || 'application/octet-stream',
  });

  if (!result) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, documentId: result.document_id });
}
