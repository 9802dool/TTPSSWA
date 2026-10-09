"use client";

import Link from "next/link";

const PDF_HREF = "/forms/DENTAL AND OPTICAL GRANT APPLICATION.pdf";

export function DentalOpticalGrantApplySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Special Reserve Police (S.R.P.) and Municipal Police members can download the official{" "}
        <a
          href={PDF_HREF}
          className="font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dental and optical grant application (PDF)
        </a>{" "}
        for printing, or complete the digital application. Original receipts and/or invoices must
        support the claim.
      </p>
      <Link href="/dental-optical-grant" className="site-btn-primary-fluid">
        Apply here
      </Link>
    </div>
  );
}
