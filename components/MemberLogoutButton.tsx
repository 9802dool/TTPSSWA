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
      className="site-btn-member-outline"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
