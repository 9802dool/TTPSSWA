"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { safeInternalNextPath } from "@/lib/safe-next-path";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bootstrapMode, setBootstrapMode] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);

  useEffect(() => {
    // Check if we should show bootstrap mode
    fetch("/api/admin/check-bootstrap")
      .then((res) => res.json())
      .then((data: { needsBootstrap?: boolean }) => {
        if (data.needsBootstrap) {
          setBootstrapMode(true);
        }
      })
      .catch(() => {
        // Ignore errors, default to normal login
      })
      .finally(() => {
        setCheckingBootstrap(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // Read the live field values as well as React state: iOS/iPadOS Safari
    // autofill can fill inputs without firing onChange.
    const form = new FormData(e.currentTarget);
    const submittedEmail = (String(form.get("email") ?? "") || email).trim();
    const submittedPassword = String(form.get("password") ?? "") || password;
    if (!submittedEmail) {
      setError("Email is required.");
      return;
    }
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Always send the email: regular login looks the admin up by email.
          email: submittedEmail,
          password: submittedPassword,
          bootstrap: bootstrapMode,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        bootstrap?: boolean;
      };
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many sign-in attempts from this network. Please wait 5 minutes and try again."
            : (data.error ?? "Sign-in failed."),
        );
        return;
      }
      const nextRaw = searchParams.get("next");
      const dest = safeInternalNextPath(nextRaw) ?? "/admin";
      // Full navigation so the new httpOnly cookie is always sent with the
      // next request (client-side router.push can reuse a cached redirect).
      window.location.assign(dest);
      return;
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (checkingBootstrap) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="h-48 animate-pulse space-y-4">
          <div className="h-4 rounded bg-[var(--border)]" />
          <div className="h-4 rounded bg-[var(--border)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">
        {bootstrapMode ? "Bootstrap Admin Account" : "Administration"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {bootstrapMode
          ? "Create the first super admin account using ADMIN_PASSWORD."
          : "Sign in for analytics, service requests, and the members profile database."}
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        {bootstrapMode && (
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-[var(--fg)]"
            >
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] outline-none ring-[var(--brand)] focus:ring-2"
              placeholder="your@email.com"
              required
            />
          </div>
        )}
        {!bootstrapMode && (
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-[var(--fg)]"
            >
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] outline-none ring-[var(--brand)] focus:ring-2"
              placeholder="your@email.com"
              required
            />
          </div>
        )}
        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-[var(--fg)]"
          >
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete={bootstrapMode ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] outline-none ring-[var(--brand)] focus:ring-2"
            required
          />
          {bootstrapMode && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Use ADMIN_PASSWORD from environment variables
            </p>
          )}
        </div>
        {error ? (
          <p
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="site-btn-block-primary w-full disabled:opacity-60"
        >
          {busy ? "Signing in…" : bootstrapMode ? "Create & Sign In" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        <Link href="/" className="text-[var(--brand)] hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
