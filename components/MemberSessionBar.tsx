"use client";

import { signOut, useSession } from "next-auth/react";

export default function MemberSessionBar() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return null;
  }

  return (
    <div className="border-b border-line bg-brand-subtle/80 px-4 py-3 dark:bg-navy-muted/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 sm:px-6 lg:px-8">
        <p className="text-sm text-ink">
          <span className="font-semibold">Member access:</span>{" "}
          <span className="text-muted">{session.user.email}</span>
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink shadow-corp transition hover:bg-canvas dark:bg-surface"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
