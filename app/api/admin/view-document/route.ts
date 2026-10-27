import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getDocumentSignedUrl } from "@/lib/supabase/applications";
import { serveDocumentInline } from "@/lib/document-inline";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
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

  // Show the document inline (opens in the browser tab instead of downloading).
  return serveDocumentInline(supabase, doc, () => getDocumentSignedUrl(doc.storage_path));
}
