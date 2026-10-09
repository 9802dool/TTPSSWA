import type { Metadata } from "next";
import Link from "next/link";
import { DentalOpticalGrantForm } from "@/components/DentalOpticalGrantForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Dental & optical grant application | TTPSSWA",
  description:
    "Apply online for the TTPSSWA dental and optical grant for Special Reserve Police (S.R.P.) and Municipal Police.",
};

export default function DentalOpticalGrantPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#f4f6f9] px-4 pb-16 pt-[calc(var(--site-header-stack)+1.25rem)] print:min-h-0 print:bg-white print:p-0">
        <p className="mx-auto mb-4 max-w-[850px] text-sm print:hidden">
          <Link href="/membership-services#members-benefits" className="font-semibold text-[#0d2a70] underline">
            ← Back to members benefits
          </Link>
          {" · "}
          <a
            href="/forms/DENTAL AND OPTICAL GRANT APPLICATION.pdf"
            className="font-semibold text-[#0d2a70] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download form (PDF)
          </a>
        </p>
        <h1 className="sr-only">
          Application for financial assistance re: Dental / Optical grant (S.R.P.&apos;s and Municipal)
        </h1>
        <DentalOpticalGrantForm />
      </main>
      <SiteFooter />
    </>
  );
}
