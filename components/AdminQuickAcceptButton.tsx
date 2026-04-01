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
      className="site-btn-admin-success-sm"
    >
      {busy ? "…" : "Accept"}
    </button>
  );
}
