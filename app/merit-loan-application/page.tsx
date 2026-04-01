import type { Metadata } from "next";
import Link from "next/link";
import { MeritLoanForm } from "@/components/MeritLoanForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Merit loan application | TTPSSWA",
  description:
    "Apply online for the TTPSSWA M.E.R.I.T. loan (Members Equity Relief In Times of need).",
};

export default function MeritLoanApplicationPage() {
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
              Merit loan application
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Members Equity Relief In Times of need (M.E.R.I.T.). Printable PDF:{" "}
              <a
                href="/forms/MERIT LOAN FORM.pdf"
                className="font-semibold text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download form (PDF)
              </a>
              .{" "}
              <Link
                href="/membership-services#members-benefits"
                className="font-semibold text-brand hover:underline"
              >
                ← Back to members benefits
              </Link>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <section aria-labelledby="merit-loan-form-heading">
            <h2 id="merit-loan-form-heading" className="sr-only">
              Digital application form
            </h2>
            <div className="border-2 border-slate-300 bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 dark:border-slate-600 dark:bg-white">
              <MeritLoanForm />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
