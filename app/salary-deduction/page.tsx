import type { Metadata } from "next";
import { SalaryDeductionForm } from "@/components/SalaryDeductionForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Salary deduction form | TTPSSWA",
  description:
    "Authorize the monthly $140.00 salary deduction for the Trinidad and Tobago Police Service Social and Welfare Association.",
};

export default function SalaryDeductionPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <h1 className="sr-only">Salary deduction form</h1>
        <SalaryDeductionForm />
      </main>
      <SiteFooter />
    </>
  );
}
