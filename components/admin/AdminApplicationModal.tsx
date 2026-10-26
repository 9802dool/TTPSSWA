"use client";

import { useState, useEffect } from "react";
import type { Application, ApplicationStatus, ApplicationDocument, ApplicationStatusHistory } from "@/lib/supabase/types";

interface Props {
  application: Application;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUSES: ApplicationStatus[] = ['submitted', 'under_review', 'approved', 'rejected', 'completed'];

export function AdminApplicationModal({ application, onClose, onUpdate }: Props) {
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(application.status);
  const [note, setNote] = useState('');
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || '');
  const [updating, setUpdating] = useState(false);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/admin/application-details?id=${application.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/update-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          status: newStatus,
          note: note.trim() || undefined,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }

      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Application</h2>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--fg)]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)]">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Status Change Note */}
          {newStatus !== application.status && (
            <div>
              <label className="block text-sm font-medium text-[var(--fg)]">
                Note for Status Change (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for status change..."
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)]">
              Admin Notes (visible to member)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Instructions or information for the member..."
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Documents */}
          {!loading && (
            <div>
              <h3 className="text-sm font-semibold">Documents ({documents.length})</h3>
              <div className="mt-2 space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-sm">
                    <span>{doc.file_name}</span>
                    <a
                      href={`/api/admin/view-document?id=${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--brand)] hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {!loading && history.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">Status History</h3>
              <div className="mt-2 space-y-2">
                {history.map(h => (
                  <div key={h.id} className="text-sm">
                    <span className="text-[var(--muted)]">
                      {new Date(h.changed_at).toLocaleString()}
                    </span>
                    {' — '}
                    <span>{h.from_status ? `${h.from_status} → ` : ''}{h.to_status}</span>
                    {h.note && <span className="text-[var(--muted)]"> ({h.note})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Data */}
          <details>
            <summary className="cursor-pointer text-sm font-semibold">Application Data</summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-[var(--bg)] p-3 text-xs">
              {JSON.stringify(application.application_data, null, 2)}
            </pre>
          </details>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
