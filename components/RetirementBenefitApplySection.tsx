"use client";

import Link from "next/link";

const PDF_HREF = "/forms/RETIREMENT APPLICATION.pdf";

export function RetirementBenefitApplySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Download the official{" "}
        <a
          href={PDF_HREF}
          className="font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          Retirement application (PDF)
        </a>{" "}
        for printing, or complete the digital application on a full page.
      </p>
      <Link href="/retirement-benefit-application" className="site-btn-primary-fluid">
        Apply here
      </Link>
    </div>
  );
}
