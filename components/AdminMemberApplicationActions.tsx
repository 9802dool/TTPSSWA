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
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-60 dark:bg-green-800 dark:hover:bg-green-700"
        >
          {busy === "accept" ? "Accepting…" : "Accept application"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void submit("reject")}
          className="rounded-lg border border-red-300 bg-[var(--surface)] px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950/40"
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
