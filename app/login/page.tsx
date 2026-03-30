import type { Metadata } from "next";
import Link from "next/link";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Signup to access members portal | TTPSSWA",
  description:
    "Submit the membership application form or sign in to the members area when approved.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] pt-[var(--site-header-stack)] dark:bg-canvas">
        <div className="border-b border-line bg-gradient-to-b from-surface to-canvas py-10 dark:from-canvas dark:to-surface">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Signup to access members portal
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Use the <span className="font-medium text-ink">Application form</span> to
              apply, or <span className="font-medium text-ink">Members login</span> when
              your application has been approved.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="rounded-sm border border-line bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5 dark:border-line dark:bg-surface dark:shadow-corp dark:ring-white/5">
              <div className="border-b border-line bg-brand-subtle/30 px-5 py-4 dark:bg-brand-subtle/15">
                <h2 className="text-base font-bold text-ink">Application form</h2>
                <p className="mt-2 text-sm text-ink">
                  Complete each section in order. Required fields are marked with{" "}
                  <span className="text-red-600">*</span>.
                </p>
              </div>
              <div className="px-4 pb-8 pt-2 sm:px-6">
                <MemberSignupForm />
              </div>
            </div>

            <div className="rounded-sm border border-line bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5 dark:border-line dark:bg-surface dark:shadow-corp dark:ring-white/5">
              <div className="border-b border-line bg-brand-subtle/30 px-5 py-4 dark:bg-brand-subtle/15">
                <h2 className="text-base font-bold text-ink">Members login</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Sign in with the username or email and password from your
                  application after an administrator has approved your account.
                </p>
              </div>
              <div className="p-6">
                <Link
                  href="/members/login"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
