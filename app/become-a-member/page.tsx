import type { Metadata } from "next";
import Link from "next/link";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import { SalaryDeductionForm } from "@/components/SalaryDeductionForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Become a Member | TTPSSWA",
  description:
    "Membership application and salary deduction forms for the Trinidad and Tobago Police Service Social and Welfare Association.",
};

export default function BecomeAMemberPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <h1 className="sr-only">Become a Member</h1>
        <p className="mx-auto mb-8 max-w-3xl text-center text-sm text-slate-700">
          To send your service ID and payslip for review, use the{" "}
          <Link href="/membership-registration" className="font-semibold text-brand hover:underline">
            registration documents form
          </Link>
          .
        </p>
        <MemberSignupForm />
        <div className="mt-16">
          <SalaryDeductionForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
