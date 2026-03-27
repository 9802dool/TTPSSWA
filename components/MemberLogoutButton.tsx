"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MemberLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/members/logout", { method: "POST" });
      router.push("/members/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={busy}
      className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-corp transition hover:border-brand/40 hover:bg-brand-subtle disabled:opacity-60 dark:bg-canvas"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
