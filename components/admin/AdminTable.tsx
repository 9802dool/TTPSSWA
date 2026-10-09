"use client";

import { useState } from "react";
import {
  getDocumentSignedUrl,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/app/actions/application-actions";

interface Application {
  id: string;
  reg_number: string;
  full_name: string;
  rank: string;
  division: string;
  phone: string;
  email: string;
  id_card_path: string;
  payslip_path: string;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
}

export default function AdminTable({
  initialApplications,
}: {
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [docUrls, setDocUrls] = useState<{ idUrl?: string; payslipUrl?: string }>({});
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const openReviewModal = async (app: Application) => {
    setSelectedApp(app);
    setNotes(app.admin_notes || "");
    setDocUrls({});
    setLoadingDocs(true);

    const [idUrl, payslipUrl] = await Promise.all([
      getDocumentSignedUrl(app.id_card_path),
      getDocumentSignedUrl(app.payslip_path),
    ]);

    setDocUrls({ idUrl: idUrl || undefined, payslipUrl: payslipUrl || undefined });
    setLoadingDocs(false);
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected" | "under_review") => {
    if (!selectedApp) return;
    setUpdating(true);

    const res = await updateApplicationStatus(selectedApp.id, newStatus, notes);
    setUpdating(false);

    if (res.success) {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === selectedApp.id ? { ...item, status: newStatus, admin_notes: notes } : item,
        ),
      );
      setSelectedApp(null);
    } else {
      window.alert(res.error || "Failed to update application.");
    }
  };

  return (
    <div className="overflow-x-auto">
      {applications.length === 0 ? (
        <p className="text-sm text-slate-600">No registration applications yet.</p>
      ) : null}
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">Reg #</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Rank / Div</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">{app.reg_number}</td>
              <td className="px-4 py-3">{app.full_name}</td>
              <td className="px-4 py-3">
                {app.rank} - {app.division}
              </td>
              <td className="px-4 py-3">
                {app.phone}
                <br />
                <span className="text-xs text-slate-400">{app.email}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    app.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : app.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : app.status === "under_review"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {app.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => void openReviewModal(app)}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-application-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="review-application-title" className="text-xl font-bold text-slate-900">
              Review Application: {selectedApp.full_name}
            </h2>
            <p className="text-sm text-slate-500">
              Reg No: {selectedApp.reg_number} | {selectedApp.rank} ({selectedApp.division})
            </p>

            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-700">Service ID Card</h3>
                {loadingDocs ? (
                  <p className="text-xs text-slate-400">Loading document...</p>
                ) : docUrls.idUrl ? (
                  <a
                    href={docUrls.idUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 underline"
                  >
                    View ID Document
                  </a>
                ) : (
                  <p className="text-xs text-red-500">Failed to load document link.</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-700">Payslip Verification</h3>
                {loadingDocs ? (
                  <p className="text-xs text-slate-400">Loading document...</p>
                ) : docUrls.payslipUrl ? (
                  <a
                    href={docUrls.payslipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 underline"
                  >
                    View Payslip Document
                  </a>
                ) : (
                  <p className="text-xs text-red-500">Failed to load document link.</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="admin-notes"
                className="mb-1 block text-xs font-semibold uppercase text-slate-600"
              >
                Administrative Notes
              </label>
              <textarea
                id="admin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes or reason for rejection..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => void handleStatusChange("under_review")}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark under review
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => void handleStatusChange("rejected")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => void handleStatusChange("approved")}
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
