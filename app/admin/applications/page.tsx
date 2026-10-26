import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getApplications } from "@/lib/supabase/applications";
import { AdminApplicationsTable } from "@/components/admin/AdminApplicationsTable";
import type { ApplicationType, ApplicationStatus } from "@/lib/supabase/types";

type Props = {
  searchParams: Promise<{ type?: string; status?: string; q?: string }> | { type?: string; status?: string; q?: string };
};

export const metadata = {
  title: "Applications Management | Admin | TTPSSWA",
  description: "Manage all member applications and benefits requests",
};

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const typeFilter = (sp.type || 'all') as ApplicationType | 'all';
  const statusFilter = (sp.status || 'all') as ApplicationStatus | 'all';
  const searchQuery = (sp.q || '').trim();

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    redirect("/admin/login?next=/admin/applications");
  }

  if (!isSupabaseConfigured()) {
    return (
      <AdminShell>
        <p className="text-sm text-red-700">
          Application storage is not configured. Add Supabase environment variables.
        </p>
      </AdminShell>
    );
  }

  // Fetch applications with filters
  let applications = await getApplications({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 500,
  });

  // Client-side search filter (on application data)
  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    applications = applications.filter(app => {
      const data = app.application_data as Record<string, unknown>;
      const searchableText = JSON.stringify(data).toLowerCase();
      return searchableText.includes(qLower) || app.id.includes(qLower);
    });
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--fg)]">All Applications</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {applications.length} application{applications.length === 1 ? '' : 's'} found
            </p>
          </div>
          <a
            href={`/api/admin/export-applications?type=${typeFilter}&status=${statusFilter}`}
            className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
          >
            Export to CSV
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)]">Application Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('type', e.target.value);
                window.location.href = url.toString();
              }}
              className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)]"
            >
              <option value="all">All Types</option>
              <option value="membership_signup">Membership Signup</option>
              <option value="formal_membership">Formal Membership</option>
              <option value="dental_optical_grant">Dental/Optical Grant</option>
              <option value="legal_aid_application">Legal Aid</option>
              <option value="merit_loan_application">Merit Loan</option>
              <option value="retirement_benefit_application">Retirement Benefit</option>
              <option value="salary_deduction">Salary Deduction</option>
              <option value="merit_salary_deduction">Merit Salary Deduction</option>
              <option value="hotel_booking">Hotel Booking</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)]">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('status', e.target.value);
                window.location.href = url.toString();
              }}
              className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-medium text-[var(--muted)]">Search</label>
            <form method="get" className="mt-1 flex gap-2">
              <input type="hidden" name="type" value={typeFilter} />
              <input type="hidden" name="status" value={statusFilter} />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Name, email, ID..."
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)]"
              />
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg)]"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <AdminApplicationsTable applications={applications} />
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="site-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Applications Management</h1>
            <p className="text-sm text-[var(--muted)]">Review and process member applications</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/members" className="text-sm text-[var(--brand)] hover:underline">
              Members
            </Link>
            <Link href="/admin" className="text-sm text-[var(--brand)] hover:underline">
              Dashboard
            </Link>
            <Link href="/" className="text-sm text-[var(--brand)] hover:underline">
              Home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="site-container py-10">{children}</main>
    </div>
  );
}
