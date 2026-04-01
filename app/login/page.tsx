import type { Metadata } from "next";
import Link from "next/link";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Become a member | TTPSSWA",
  description:
    "Submit the Trinidad and Tobago Police Service Social Welfare Association membership application online.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Become a Member Apply Here
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Complete the digital membership application below. You can also download a
              printable copy from{" "}
              <a
                href="/forms/MEMBERSHIP APPLICATION.pdf"
                className="font-semibold text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Membership application (PDF)
              </a>
              . Already approved?{" "}
              <Link href="/members/login" className="font-semibold text-brand hover:underline">
                Members login
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="border-2 border-slate-300 bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 dark:border-slate-600 dark:bg-white">
            <MemberSignupForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
