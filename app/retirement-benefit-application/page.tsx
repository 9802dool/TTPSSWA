import type { Metadata } from "next";
import Link from "next/link";
import { RetirementBenefitForm } from "@/components/RetirementBenefitForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Retirement benefit application | TTPSSWA",
  description:
    "Apply online for the TTPSSWA retirement benefit (membership five years and over).",
};

export default function RetirementBenefitApplicationPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)] print:min-h-0 print:bg-white print:p-0">
        <p className="mx-auto mb-4 max-w-[850px] text-sm print:hidden">
          <Link href="/membership-services#members-benefits" className="font-semibold text-[#0d2a70] underline">
            ← Back to members benefits
          </Link>
        </p>
        <h1 className="sr-only">Retirement benefit application form</h1>
        <RetirementBenefitForm />
      </main>
      <SiteFooter />
    </>
  );
}
