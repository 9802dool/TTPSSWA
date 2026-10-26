import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import {
  verifyAdminSession,
  getAdminCookieName,
  hasRole,
  listAdminUsers,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    redirect("/admin/login?next=/admin/users");
  }

  if (!hasRole(session, "super_admin")) {
    redirect("/admin");
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
        <SiteHeader />
        <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
          <div className="site-container-admin py-4">
            <h1 className="text-lg font-semibold">Admin Users</h1>
          </div>
        </header>
        <main className="site-container-admin py-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">Supabase not configured</p>
            <p className="mt-1 text-sm">
              Individual admin accounts require Supabase to be configured.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const admins = await listAdminUsers();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="site-container-admin flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Admin Users
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Manage admin accounts and permissions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Registration documents
            </Link>
            <Link
              href="/admin/new-membership"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Applications
            </Link>
            <Link
              href="/admin/members"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Members
            </Link>
            <Link
              href="/"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="site-container-admin space-y-6 py-10">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-base font-semibold">Role Permissions</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-[var(--brand)]">
                super_admin
              </dt>
              <dd className="mt-1 text-sm text-[var(--muted)]">
                Full access: manage admins, export CSV, change status, add notes
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[var(--brand)]">staff</dt>
              <dd className="mt-1 text-sm text-[var(--muted)]">
                Change application status and add notes
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[var(--brand)]">
                viewer
              </dt>
              <dd className="mt-1 text-sm text-[var(--muted)]">
                Read-only access to all admin pages
              </dd>
            </div>
          </dl>
        </div>

        <AdminUsersTable admins={admins} currentUserId={session.userId} />
      </main>
    </div>
  );
}
