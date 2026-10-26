import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getMemberSessionUserId } from "@/lib/member-session";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { 
  getApplications, 
  getMemberWithApplications,
  getApplicationById,
} from "@/lib/supabase/applications";
import { MemberApplicationCard } from "@/components/member/MemberApplicationCard";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const metadata = {
  title: "My Dashboard | TTPSSWA",
  description: "View your membership applications and status",
};

export default async function MemberDashboardPage() {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    redirect("/login?next=/member/dashboard");
  }

  if (!isDatabaseConfigured()) {
    return (
      <DashboardShell>
        <p className="text-sm text-red-700">
          Account database is not configured. Contact site administrator.
        </p>
      </DashboardShell>
    );
  }

  // Get user account from Prisma
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    redirect("/login?next=/member/dashboard");
  }

  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell userName={user.fullName}>
        <p className="text-sm text-amber-700">
          Application storage is not yet configured. Your applications will appear here once the system is set up.
        </p>
      </DashboardShell>
    );
  }

  // Get all applications for this member by email
  const allApplications = await getApplications({
    limit: 100,
  });

  // Filter to member's applications by email or service number
  const memberApplications = allApplications.filter(app => {
    const data = app.application_data as Record<string, unknown>;
    const appEmail = String(data.email || '').toLowerCase();
    const appServiceNumber = String(data.regimentalNumber || data.serviceNumber || '');
    
    return (
      appEmail === user.email.toLowerCase() ||
      (user.serviceNumber && appServiceNumber === user.serviceNumber)
    );
  });

  // Get detailed data for each application
  const applicationsWithDetails = await Promise.all(
    memberApplications.map(async (app) => {
      const details = await getApplicationById(app.id);
      return details;
    })
  );

  const validApplications = applicationsWithDetails.filter(Boolean);

  return (
    <DashboardShell userName={user.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--fg)]">My Applications</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track the status of your membership and benefit applications
          </p>
        </div>

        {validApplications.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-[var(--muted)]">You haven't submitted any applications yet.</p>
            <Link
              href="/membership-services"
              className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
            >
              View available services →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {validApplications.map((appDetail) => (
              <MemberApplicationCard
                key={appDetail!.application.id}
                application={appDetail!.application}
                member={appDetail!.member}
                documents={appDetail!.documents}
                history={appDetail!.history}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function DashboardShell({ 
  children,
  userName,
}: { 
  children: React.ReactNode;
  userName?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <div className="pt-[var(--site-header-stack)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="site-container py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {userName ? `Welcome, ${userName}` : 'Member Dashboard'}
                </h1>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Manage your applications and membership
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/membership-services"
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  Apply for Services
                </Link>
                <Link
                  href="/"
                  className="text-sm text-[var(--brand)] hover:underline"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="site-container py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
