import type { Metadata } from "next";
import Link from "next/link";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import { SalaryDeductionForm } from "@/components/SalaryDeductionForm";
import { MembershipFlowBanner } from "@/components/MembershipFlowBanner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Become a Member | TTPSSWA",
  description:
    "Membership application and salary deduction forms for the Trinidad and Tobago Police Service Social and Welfare Association.",
  openGraph: {
    title: "Become a Member | TTPSSWA",
    description: "Membership application and salary deduction forms for the Trinidad and Tobago Police Service Social and Welfare Association.",
    url: 'https://ttpsswa.vercel.app/become-a-member',
  },
};

export default function BecomeAMemberPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <h1 className="sr-only">Become a Member</h1>
        
        <div className="mb-12">
          <MembershipFlowBanner />
        </div>

        <p className="mx-auto mb-8 max-w-3xl text-center text-sm text-slate-700">
          <strong>Quick signup</strong> (for mobile or if you don't have an account yet):
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
