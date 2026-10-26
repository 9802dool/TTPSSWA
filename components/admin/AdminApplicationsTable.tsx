"use client";

import { useState } from "react";
import type { Application, ApplicationStatus } from "@/lib/supabase/types";
import { AdminApplicationModal } from "./AdminApplicationModal";

interface Props {
  applications: Application[];
}

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  membership_signup: "Membership Signup",
  formal_membership: "Formal Membership",
  dental_optical_grant: "Dental/Optical Grant",
  legal_aid_application: "Legal Aid",
  merit_loan_application: "Merit Loan",
  retirement_benefit_application: "Retirement Benefit",
  salary_deduction: "Salary Deduction",
  hotel_booking: "Hotel Booking",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function AdminApplicationsTable({ applications }: Props) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <p className="text-[var(--muted)]">No applications match your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
            <tr>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const data = app.application_data as Record<string, unknown>;
              const applicantName = String(data.fullName || data.guestName || 'N/A');
              const applicantEmail = String(data.email || 'N/A');

              return (
                <tr
                  key={app.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(app.submitted_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {APPLICATION_TYPE_LABELS[app.application_type] || app.application_type}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{applicantName}</p>
                      <p className="text-xs text-[var(--muted)]">{applicantEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-sm font-medium text-[var(--brand)] hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <AdminApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={() => {
            setSelectedApp(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
