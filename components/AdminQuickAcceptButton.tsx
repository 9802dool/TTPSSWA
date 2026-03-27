"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminQuickAcceptButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/member-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, action: "accept" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void accept()}
      className="rounded-md bg-green-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-60 dark:bg-green-800"
    >
      {busy ? "…" : "Accept"}
    </button>
  );
}
