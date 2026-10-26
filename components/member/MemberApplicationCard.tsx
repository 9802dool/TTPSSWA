"use client";

import { useState } from "react";
import type { Application, ApplicationDocument, ApplicationStatusHistory, Member } from "@/lib/supabase/types";

interface Props {
  application: Application;
  member: Member | null;
  documents: ApplicationDocument[];
  history: ApplicationStatusHistory[];
}

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  membership_signup: "Membership Signup",
  formal_membership: "Formal Membership",
  dental_optical_grant: "Dental/Optical Grant",
  legal_aid_application: "Legal Aid",
  merit_loan_application: "Merit Loan",
  retirement_benefit_application: "Retirement Benefit",
  salary_deduction: "Salary Deduction",
  merit_salary_deduction: "Merit Salary Deduction",
  hotel_booking: "Hotel Booking",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  under_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function MemberApplicationCard({ application, documents, history }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const typeLabel = APPLICATION_TYPE_LABELS[application.application_type] || application.application_type;
  const statusColor = STATUS_COLORS[application.status] || STATUS_COLORS.submitted;

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', application.id);
    formData.append('documentType', 'additional_document');

    try {
      const res = await fetch('/api/member/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      window.location.reload();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-[var(--fg)]">{typeLabel}</h3>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
              {application.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Submitted {new Date(application.submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {application.admin_notes && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Admin Note:</p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">{application.admin_notes}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-[var(--brand)] hover:underline"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 space-y-6 border-t border-[var(--border)] pt-6">
          {/* Status Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--fg)]">Status History</h4>
            <div className="mt-3 space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No status changes yet</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="flex gap-3 text-sm">
                    <span className="text-[var(--muted)]">
                      {new Date(h.changed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[var(--fg)]">
                      {h.from_status ? `${h.from_status} → ` : ''}{h.to_status}
                    </span>
                    {h.note && <span className="text-[var(--muted)]">— {h.note}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--fg)]">Submitted Documents</h4>
            <div className="mt-3 space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No documents attached</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--fg)] truncate">{doc.file_name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {doc.document_type.replace(/_/g, ' ')} • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={`/api/member/view-document?id=${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-sm font-medium text-[var(--brand)] hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
            
            {/* Upload Additional Document */}
            {application.status !== 'completed' && application.status !== 'cancelled' && (
              <div className="mt-4">
                <label className="block">
                  <span className="text-sm font-medium text-[var(--fg)]">Upload Additional Document</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDoc}
                    className="mt-2 block w-full text-sm text-[var(--fg)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--brand)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[var(--brand-hover)] disabled:opacity-50"
                  />
                </label>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
                {uploadingDoc && (
                  <p className="mt-2 text-sm text-[var(--muted)]">Uploading...</p>
                )}
              </div>
            )}
          </div>

          {/* Application Data */}
          <details className="rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <summary className="cursor-pointer p-3 text-sm font-medium text-[var(--fg)]">
              Application Details
            </summary>
            <div className="border-t border-[var(--border)] p-3">
              <pre className="whitespace-pre-wrap break-words text-xs text-[var(--muted)]">
                {JSON.stringify(application.application_data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
