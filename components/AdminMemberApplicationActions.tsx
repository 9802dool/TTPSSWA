"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  memberId: string;
  applicationStatus: string;
};

export function AdminMemberApplicationActions({
  memberId,
  applicationStatus,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (applicationStatus !== "pending") {
    return (
      <p className="text-sm text-[var(--muted)]">
        No actions — application is already{" "}
        <span className="font-medium text-[var(--fg)]">{applicationStatus}</span>.
      </p>
    );
  }

  async function submit(action: "accept" | "reject") {
    setError(null);
    setBusy(action);
    try {
      const res = await fetch("/api/admin/member-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Approve to allow this member to sign in at{" "}
        <span className="font-mono text-xs">/members/login</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void submit("accept")}
          className="site-btn-admin-success"
        >
          {busy === "accept" ? "Accepting…" : "Accept application"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void submit("reject")}
          className="site-btn-admin-danger-outline"
        >
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
