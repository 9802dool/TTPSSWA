import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Become a member | TTPSSWA",
  description:
    "Learn about membership with the Trinidad and Tobago Police Service Social Welfare Association.",
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
              Become a Member Apply Here
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Thank you for your interest in joining the association. Overview of membership
              services and benefits is available on our dedicated page.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-sm border border-line bg-surface p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5 dark:border-line dark:bg-surface dark:shadow-corp dark:ring-white/5 sm:p-10">
            <p className="text-sm leading-relaxed text-muted">
              For members portal access after approval, use{" "}
              <Link href="/members/login" className="font-semibold text-brand hover:underline">
                Members login
              </Link>
              {" "}
              or visit the{" "}
              <Link href="/members-portal" className="font-semibold text-brand hover:underline">
                Members portal
              </Link>
              .
            </p>
            <p className="mt-6">
              <Link
                href="/membership-services"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover"
              >
                Membership services &amp; benefits →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
