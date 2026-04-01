"use client";

const PDF_HREF = "/forms/MERIT LOAN FORM.pdf";

export function MeritLoanApplySection() {
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
          Merit loan application (PDF)
        </a>{" "}
        for printing and submission.
      </p>
      <a
        href={PDF_HREF}
        className="site-btn-primary-fluid"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download Merit loan form
      </a>
    </div>
  );
}
