"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink shadow-corp outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/25 dark:bg-surface";

export default function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/membership-services";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("member", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-8 shadow-corp dark:bg-surface"
      noValidate
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        Members
      </p>
      <h2 className="mt-2 text-2xl font-bold text-ink">Sign in</h2>
      <p className="mt-2 text-sm text-muted">
        Use the member email and password configured for this site (
        <code className="rounded bg-line/80 px-1 py-0.5 text-xs">MEMBER_EMAIL</code>{" "}
        / <code className="rounded bg-line/80 px-1 py-0.5 text-xs">MEMBER_PASSWORD</code>{" "}
        in <code className="rounded bg-line/80 px-1 py-0.5 text-xs">.env.local</code>
        ).
      </p>

      {error ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="member-email" className="text-sm font-semibold text-ink">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="member-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="member-password"
            className="text-sm font-semibold text-ink"
          >
            Password <span className="text-red-600">*</span>
          </label>
          <input
            id="member-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-corp transition hover:bg-brand-hover disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Access membership services"}
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-brand hover:text-brand-hover"
        >
          ← Back to home
        </Link>
      </div>
    </form>
  );
}
