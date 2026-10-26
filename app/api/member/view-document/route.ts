import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getDocumentSignedUrl } from "@/lib/supabase/applications";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');

  if (!documentId) {
    return NextResponse.json({ error: "Document ID required" }, { status: 400 });
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

  // Get document and verify it belongs to this user's application
  const { data: doc, error: docError } = await supabase
    .from('application_documents')
    .select('*, applications!inner(member_id, members!inner(email))')
    .eq('id', documentId)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Verify member owns this document
  const memberEmail = (doc as any).applications?.members?.email;
  if (memberEmail !== user.email) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Generate signed URL
  const signedUrl = await getDocumentSignedUrl(doc.storage_path);
  
  if (!signedUrl) {
    return NextResponse.json({ error: "Could not generate document URL" }, { status: 500 });
  }

  // Redirect to signed URL
  return NextResponse.redirect(signedUrl);
}
