"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeInternalNextPath } from "@/lib/safe-next-path";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none ring-brand placeholder:text-muted focus:ring-2 dark:bg-canvas";

type Props = {
  /** Server-validated path (e.g. from ?next=) to open after successful sign-in. */
  redirectAfterLogin?: string | null;
};

export function MembersLoginForm({ redirectAfterLogin }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const identifier = String(fd.get("identifier") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    try {
      const res = await fetch("/api/members/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Sign-in failed. Please try again.");
        return;
      }
      const dest = safeInternalNextPath(redirectAfterLogin ?? null) ?? "/";
      router.replace(dest);
      router.refresh();
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-8 space-y-5 text-left"
    >
      <div>
        <label htmlFor="identifier" className="text-sm font-medium text-ink">
          Username or email <span className="text-red-600">*</span>
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
          placeholder="Same as on your application"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {message ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
