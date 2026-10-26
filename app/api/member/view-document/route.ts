import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { verifyDocumentOwnership } from "@/lib/supabase/member-helpers";
import { getDocumentSignedUrl } from "@/lib/supabase/applications";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { isEmailVerified } from "@/lib/verify-account-helper";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

  // Verify document belongs to this user (case-insensitive email match)
  const ownership = await verifyDocumentOwnership(documentId, user.email);
  if (!ownership) {
    return NextResponse.json({ error: "Document not found or access denied" }, { status: 403 });
  }

  // Generate signed URL
  const signedUrl = await getDocumentSignedUrl(ownership.document.storage_path);
  
  if (!signedUrl) {
    return NextResponse.json({ error: "Could not generate document URL" }, { status: 500 });
  }

  // Redirect to signed URL
  return NextResponse.redirect(signedUrl);
}
