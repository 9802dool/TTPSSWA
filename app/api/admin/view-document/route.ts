import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getDocumentSignedUrl } from "@/lib/supabase/applications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  
  if (!token || !verifyAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');

  if (!documentId) {
    return NextResponse.json({ error: "Document ID required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not available" }, { status: 503 });
  }

  // Get document
  const { data: doc, error } = await supabase
    .from('application_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Generate signed URL
  const signedUrl = await getDocumentSignedUrl(doc.storage_path);
  
  if (!signedUrl) {
    return NextResponse.json({ error: "Could not generate document URL" }, { status: 500 });
  }

  // Redirect to signed URL
  return NextResponse.redirect(signedUrl);
}
