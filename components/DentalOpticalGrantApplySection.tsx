"use client";

import { useState } from "react";
import { DentalOpticalGrantForm } from "@/components/DentalOpticalGrantForm";

const PDF_HREF = "/forms/DENTAL AND OPTICAL GRANT APPLICATION.pdf";

export function DentalOpticalGrantApplySection() {
  const [showForm, setShowForm] = useState(false);

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
          Dental and optical grant application (PDF)
        </a>{" "}
        for printing, or use the digital application.
      </p>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-brand px-8 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover sm:w-auto"
        >
          Apply here
        </button>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-sm font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
          >
            ← Hide application form
          </button>
          <DentalOpticalGrantForm />
        </div>
      )}
    </div>
  );
}
