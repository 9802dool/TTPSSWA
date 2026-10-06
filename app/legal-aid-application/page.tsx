import type { Metadata } from "next";
import Link from "next/link";
import { LegalAidApplicationForm } from "@/components/LegalAidApplicationForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Legal aid application | TTPSSWA",
  description:
    "Apply online for TTPSSWA legal aid assistance (criminal and disciplinary matters).",
};

export default function LegalAidApplicationPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)]">
        <p className="mx-auto mb-4 max-w-[850px] text-sm">
          <Link href="/membership-services#members-benefits" className="font-semibold text-[#0d2a70] underline">
            ← Back to members benefits
          </Link>
        </p>
        <h1 className="sr-only">Legal aid application</h1>
        <LegalAidApplicationForm />
      </main>
      <SiteFooter />
    </>
  );
}
