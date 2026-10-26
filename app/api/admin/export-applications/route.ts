import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getApplications } from "@/lib/supabase/applications";
import type { ApplicationType, ApplicationStatus } from "@/lib/supabase/types";

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
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  const applications = await getApplications({
    type: (type && type !== 'all') ? type as ApplicationType : undefined,
    status: (status && status !== 'all') ? status as ApplicationStatus : undefined,
    limit: 10000,
  });

  // Build CSV
  const headers = [
    'ID',
    'Type',
    'Status',
    'Submitted At',
    'Applicant Name',
    'Email',
    'Phone',
    'Service Number',
    'Admin Notes',
  ];

  const rows = applications.map(app => {
    const data = app.application_data as Record<string, unknown>;
    return [
      app.id,
      app.application_type,
      app.status,
      app.submitted_at,
      String(data.fullName || data.guestName || ''),
      String(data.email || ''),
      String(data.phone || ''),
      String(data.regimentalNumber || data.serviceNumber || ''),
      String(app.admin_notes || ''),
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const filename = `ttpsswa-applications-${type || 'all'}-${status || 'all'}-${Date.now()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
