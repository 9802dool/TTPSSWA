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
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <p className="mx-auto mb-4 max-w-[850px] text-sm">
          <Link href="/membership-services#members-benefits" className="font-semibold text-[#0d2a70] underline">
            ← Back to members benefits
          </Link>
        </p>
        <h1 className="sr-only">Merit application form</h1>
        <MeritLoanForm />
      </main>
      <SiteFooter />
    </>
  );
}
