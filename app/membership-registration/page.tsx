import type { Metadata } from "next";
import { RegistrationDocumentsForm } from "@/components/RegistrationDocumentsForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Registration documents | TTPSSWA",
  description: "Submit your service ID and payslip for TTPSSWA registration review.",
};

export default function MembershipRegistrationPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+2rem)]">
        <RegistrationDocumentsForm />
      </main>
      <SiteFooter />
    </>
  );
}
