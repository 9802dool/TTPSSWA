"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeInternalNextPath } from "@/lib/safe-next-path";

const inputClassDefault =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none ring-brand placeholder:text-muted focus:ring-2 dark:bg-canvas";

const inputClassDark =
  "mt-1 w-full rounded-md border border-slate-600/80 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-100 shadow-sm outline-none ring-sky-500/40 placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-2";

type Props = {
  /** Server-validated path (e.g. from ?next=) to open after successful sign-in. */
  redirectAfterLogin?: string | null;
  /** Dark inputs for members login page (dark hero layout). */
  variant?: "default" | "dark";
};

export function MembersLoginForm({
  redirectAfterLogin,
  variant = "default",
}: Props) {
  const inputClass = variant === "dark" ? inputClassDark : inputClassDefault;
  const labelClass =
    variant === "dark" ? "text-sm font-medium text-slate-200" : "text-sm font-medium text-ink";
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
        <label htmlFor="identifier" className={labelClass}>
          Username or email <span className="text-red-500">*</span>
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
        <label htmlFor="password" className={labelClass}>
          Password <span className="text-red-500">*</span>
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
          className={
            variant === "dark"
              ? "rounded-md border border-red-800/80 bg-red-950/50 px-3 py-2 text-sm text-red-100"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="site-btn-block-primary disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
