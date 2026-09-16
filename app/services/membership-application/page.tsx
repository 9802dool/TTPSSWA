import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import MembershipApplyForm from "@/components/MembershipApplyForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/session-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Membership application | TTPSSWA",
  description:
    "Submit formal association membership and salary deduction authorization.",
};

export default async function MembershipApplicationPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/services/membership-application");
  }

  const existing = user.membershipApplication;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="site-container">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Formal membership application
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Signed in as {user.fullName}. Printable reference:{" "}
              <a
                href="/forms/SALARY DEDUCTION.pdf"
                className="font-semibold text-brand underline hover:text-brand-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Salary deduction PDF
              </a>
              .
            </p>
          </div>
        </div>
        <div className="site-container px-4 py-12 sm:px-6">
          {existing ? (
            <div className="mx-auto max-w-lg rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
              <h2 className="text-xl font-bold text-ink">Application on file</h2>
              <p className="mt-2 text-sm text-muted">
                Status: <span className="font-semibold text-ink">{existing.status}</span>
                . Submitted{" "}
                {existing.submittedAt.toLocaleDateString("en-TT", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
              <p className="mt-4 text-sm text-muted">
                <Link href="/" className="font-semibold text-brand hover:underline">
                  Return home
                </Link>
              </p>
            </div>
          ) : (
            <MembershipApplyForm userId={user.id} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
