import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminTable from "@/components/admin/AdminTable";
import SiteHeader from "@/components/SiteHeader";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { isRegistrationAdmin } from "@/lib/registration-admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const siteAdmin = Boolean(token && verifyAdminSession(token));
  const admin = siteAdmin ? { ok: true } : await isRegistrationAdmin();

  if (!admin.ok) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell>
        <p className="text-sm text-slate-700">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then run{" "}
          <code>supabase/registration-pipeline.sql</code> in the Supabase SQL editor.
        </p>
      </DashboardShell>
    );
  }

  const service = createServiceClient();
  const supabase = service ?? (await createClient());
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell>
      {error ? (
        <p className="mb-4 text-sm text-red-700">
          Could not load applications. Confirm the SQL script has been run
          {service ? "." : " and that SUPABASE_SERVICE_ROLE_KEY is set for this admin."}
        </p>
      ) : null}
      <AdminTable initialApplications={applications || []} />
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="px-4 pb-16 pt-[calc(var(--site-header-stack)+2rem)] sm:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">TTPSSWA Registration Processing</h1>
            <p className="text-slate-600">
              Review member submissions and verify attached identification documents.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-slate-700 underline">
            Site administration
          </Link>
        </header>
        <main className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{children}</main>
      </div>
    </div>
  );
}
