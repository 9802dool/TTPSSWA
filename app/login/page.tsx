import type { Metadata } from "next";
import Link from "next/link";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Signup / Login | TTPSSWA",
  description:
    "Submit a membership application or access TTPSSWA member services.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4.25rem)] bg-[#f4f6f9] pt-[4.25rem] dark:bg-canvas">
        <div className="border-b border-line bg-gradient-to-b from-surface to-canvas py-10 dark:from-canvas dark:to-surface">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Membership application
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Use this form to apply for membership review. After approval, you
              will be able to sign in with your username and password when member
              login is enabled.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-sm border border-line bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5 dark:border-line dark:bg-surface dark:shadow-corp dark:ring-white/5">
            <div className="border-b border-line bg-brand-subtle/30 px-5 py-4 dark:bg-brand-subtle/15">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Application form
              </p>
              <p className="mt-1 text-sm text-ink">
                Please complete each section in order. All required fields are
                marked with <span className="text-red-600">*</span>.
              </p>
            </div>
            <div className="px-4 pb-8 pt-2 sm:px-6">
              <MemberSignupForm />
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface p-6 shadow-corp dark:bg-canvas">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Already registered?</h2>
                <p className="mt-1 text-sm text-muted">
                  Use members login when online access is available for approved
                  accounts.
                </p>
              </div>
              <Link
                href="/members/login"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md border border-line bg-canvas px-6 text-sm font-semibold text-ink shadow-corp transition hover:border-brand/40 hover:bg-brand-subtle dark:bg-surface"
              >
                Members login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
