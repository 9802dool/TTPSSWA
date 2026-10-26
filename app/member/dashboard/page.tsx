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
import { getAccountVerificationStatus } from "@/lib/verify-account-helper";
import { getWebAccountById } from "@/lib/web-account-storage";
import { filterOwnedApplications } from "@/lib/dashboard-filters";

export const metadata = {
  title: "My Dashboard | TTPSSWA",
  description: "View your membership applications and status",
};

export default async function MemberDashboardPage() {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    redirect("/login?next=/member/dashboard");
  }

  // Check email verification status (uses Redis WebAccount)
  const verificationStatus = await getAccountVerificationStatus(userId);
  
  if (!verificationStatus) {
    redirect("/login?next=/member/dashboard");
  }

  if (!verificationStatus.isVerified) {
    return (
      <DashboardShell userName={verificationStatus.fullName}>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Email Verification Required</h2>
          <p className="mt-2 text-sm text-amber-800">
            Please verify your email address to access your dashboard and applications.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            Check your inbox at <strong>{verificationStatus.email}</strong> for a verification code.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/verify-email"
              className="inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Enter Verification Code
            </Link>
            <form method="POST" action="/api/auth/resend-verification">
              <button
                type="submit"
                className="rounded-md border border-amber-600 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-100"
              >
                Resend Verification Email
              </button>
            </form>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Get user account from Redis (production uses WebAccount in Upstash Redis)
  const account = await getWebAccountById(userId);
  
  if (!account) {
    redirect("/login?next=/member/dashboard");
  }

  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell userName={account.fullName}>
        <p className="text-sm text-amber-700">
          Application storage is not yet configured. Your applications will appear here once the system is set up.
        </p>
      </DashboardShell>
    );
  }

  // Resolve member record by case-insensitive email match
  const { getMemberByEmail } = await import('@/lib/supabase/member-helpers');
  const member = await getMemberByEmail(account.email);

  if (!member) {
    return (
      <DashboardShell userName={account.fullName}>
        <p className="text-sm text-amber-700">
          No member record found. Your applications will appear here once you submit one or are registered by an administrator.
        </p>
      </DashboardShell>
    );
  }

  // Query applications directly by member_id (database-level filtering)
  const memberApplications = await getApplications({
    member_id: member.id,
    limit: 100,
  });

  // Filter to owned applications using the pure function
  const ownedApplications = filterOwnedApplications(
    memberApplications,
    account.email,
    member.email,
    member.id
  );

  // Get detailed data for each application
  const applicationsWithDetails = await Promise.all(
    ownedApplications.map(async (app) => {
      const details = await getApplicationById(app.id);
      return details;
    })
  );

  const validApplications = applicationsWithDetails.filter(Boolean);

  return (
    <DashboardShell userName={account.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--fg)]">My Applications</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track the status of your membership and benefit applications
          </p>
        </div>

        {validApplications.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-[var(--muted)]">You haven&apos;t submitted any applications yet.</p>
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
