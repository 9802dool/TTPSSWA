import type { Metadata } from "next";
import { MemberSignupForm } from "@/components/MemberSignupForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership form | TTPSSWA",
  description: "Apply for membership with the Trinidad and Tobago Police Service Social and Welfare Association.",
};

export default function MembershipFormPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <h1 className="sr-only">Membership form</h1>
        <MemberSignupForm />
      </main>
      <SiteFooter />
    </>
  );
}
