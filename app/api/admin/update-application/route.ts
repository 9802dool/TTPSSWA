import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName, hasRole } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { updateApplicationStatus, getApplicationById } from "@/lib/supabase/applications";
import type { ApplicationStatus } from "@/lib/supabase/types";
import { sendStatusChangeEmail } from "@/lib/email-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user has at least staff role
  if (!hasRole(session, "staff")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  let body: {
    applicationId?: string;
    status?: ApplicationStatus;
    note?: string;
    adminNotes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { applicationId, status, note, adminNotes } = body;

  if (!applicationId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate status against enum
  const validStatuses: ApplicationStatus[] = [
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'completed',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  // Get application details before update for email
  const appDetails = await getApplicationById(applicationId);

  // Update status with admin user info
  const success = await updateApplicationStatus(
    applicationId,
    status,
    {
      changed_by_type: 'admin',
      changed_by_id: session.userId,
      changed_by_name: session.email,
      note: note || undefined,
      admin_notes: adminNotes || undefined,
    }
  );

  if (!success) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Send email notification (non-blocking)
  if (appDetails) {
    const data = appDetails.application.application_data as Record<string, unknown>;
    const email = String(data.email || '');
    const name = String(data.fullName || data.guestName || '');
    
    if (email) {
      sendStatusChangeEmail({
        to: email,
        applicantName: name,
        applicationType: appDetails.application.application_type,
        oldStatus: appDetails.application.status,
        newStatus: status,
        note: note,
        adminNotes: adminNotes,
      }).catch(err => {
        console.error('Failed to send status change email:', err);
      });
    }
  }

  return NextResponse.json({ ok: true });
}
