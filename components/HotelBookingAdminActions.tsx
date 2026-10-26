"use client";

import { useState } from "react";
import type { HotelBookingMeta } from "@/lib/hotel-booking-meta";

function formatIso(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function HotelBookingAdminActions({
  recordId,
  initialMeta,
  storageConfigured,
  currentStatus,
  isSupabaseBooking,
  sessionRole,
}: {
  recordId: string;
  initialMeta: HotelBookingMeta | null;
  storageConfigured: boolean;
  currentStatus?: string;
  isSupabaseBooking?: boolean;
  sessionRole?: string;
}) {
  const [meta, setMeta] = useState<HotelBookingMeta>(initialMeta ?? {});
  const [replyNote, setReplyNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const statusDisplayMap: Record<string, string> = {
    submitted: "Pending",
    under_review: "Under Review",
    approved: "Confirmed",
    completed: "Checked Out",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };
  
  const displayStatus = currentStatus ? statusDisplayMap[currentStatus] || currentStatus : "Unknown";
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "approved");
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  async function patch(body: { action: string; repliedEmailNote?: string; bookingStatus?: string }) {
    setBusy(true);
    setErr(null);
    setStatusSuccess(null);
    const res = await fetch(
      `/api/admin/hotel-bookings/${encodeURIComponent(recordId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      meta?: HotelBookingMeta;
    };
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Request failed.");
      return;
    }
    if (data.meta) setMeta(data.meta);
    if (body.action === "replied") setReplyNote("");
    if (body.action === "update_status") {
      setStatusSuccess("Status updated successfully. Refresh to see changes.");
    }
  }

  if (!storageConfigured) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Redis is not configured; quotation tracking and confirmation actions are
        unavailable.
      </p>
    );
  }

  const canUpdateStatus = sessionRole === "super_admin" || sessionRole === "staff";

  return (
    <div className="space-y-4">
      {isSupabaseBooking && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Booking Status
          </p>
          <p className="mt-2 text-sm font-medium">
            Current: <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs">{displayStatus}</span>
          </p>
          {canUpdateStatus ? (
            <>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Change the booking status for performance metrics.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  disabled={busy}
                >
                  <option value="submitted">Pending / Request</option>
                  <option value="approved">Confirmed</option>
                  <option value="completed">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  disabled={busy || selectedStatus === currentStatus}
                  onClick={() => patch({ action: "update_status", bookingStatus: selectedStatus })}
                  className="site-btn-admin-primary disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Update Status"}
                </button>
              </div>
              {statusSuccess && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {statusSuccess}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted)]">
              (Read-only for viewer role)
            </p>
          )}
        </div>
      )}
      <dl className="space-y-2 text-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-[var(--muted)]">Quotation email sent</dt>
          <dd className="text-right font-medium text-[var(--fg)]">
            {formatIso(meta.quotationEmailSentAt)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-[var(--muted)]">Quotation email opened</dt>
          <dd className="text-right font-medium text-[var(--fg)]">
            {formatIso(meta.quotationEmailOpenedAt)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-[var(--muted)]">Booking status</dt>
          <dd className="text-right font-medium text-[var(--fg)]">
            {meta.confirmed ? "Confirmed" : "Not confirmed"}
            {meta.confirmedAt ? (
              <span className="block text-xs font-normal text-[var(--muted)]">
                {formatIso(meta.confirmedAt)}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Replied email</dt>
          <dd className="mt-1 text-[var(--fg)]">
            {meta.repliedEmailAt ? (
              <>
                <span className="font-medium">{formatIso(meta.repliedEmailAt)}</span>
                {meta.repliedEmailNote ? (
                  <p className="mt-2 whitespace-pre-wrap rounded border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-relaxed">
                    {meta.repliedEmailNote}
                  </p>
                ) : (
                  <span className="text-[var(--muted)]"> (no note)</span>
                )}
              </>
            ) : (
              <span className="text-[var(--muted)]">Not logged yet</span>
            )}
          </dd>
        </div>
      </dl>

      {err ? (
        <p className="text-sm text-red-600" role="alert">
          {err}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        {!meta.confirmed ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ action: "confirm" })}
            className="site-btn-admin-primary disabled:opacity-50"
          >
            {busy ? "Saving…" : "Mark confirmed"}
          </button>
        ) : (
          <p className="text-sm text-[var(--muted)]">This booking is confirmed.</p>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Log replied email
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Record that you emailed the guest (optional note, e.g. summary of rates
          sent).
        </p>
        <textarea
          value={replyNote}
          onChange={(e) => setReplyNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
          placeholder="Optional note about the email you sent…"
          disabled={busy}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            patch({ action: "replied", repliedEmailNote: replyNote })
          }
          className="site-btn-admin-muted mt-3 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save replied email"}
        </button>
      </div>
    </div>
  );
}
