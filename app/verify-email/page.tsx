"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);

  const handleVerify = useCallback(async (userId: string, verificationCode: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/member/dashboard");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }, [router]);

  // Auto-verify if code and userId are in URL
  useEffect(() => {
    const urlCode = searchParams.get("code");
    const urlUserId = searchParams.get("userId");

    if (urlCode && urlUserId && !autoVerifying && !success) {
      setAutoVerifying(true);
      setCode(urlCode);
      handleVerify(urlUserId, urlCode);
    }
  }, [searchParams, autoVerifying, success, handleVerify]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Please enter a verification code");
      return;
    }

    // Get userId from session by calling an API that returns it
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.userId) {
        setError("Session not found. Please log in again.");
        return;
      }

      await handleVerify(sessionData.userId, code);
    } catch (err) {
      setError("Failed to verify. Please try again.");
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend verification email");
        setLoading(false);
        return;
      }

      alert("Verification email sent! Please check your inbox.");
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader />
      <div className="pt-[var(--site-header-stack)]">
        <main className="site-container py-16">
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
              {success ? (
                <div className="text-center">
                  <div className="mb-4 text-5xl">✅</div>
                  <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Your email has been verified successfully.
                  </p>
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    Redirecting to your dashboard...
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-[var(--fg)]">Verify Your Email</h1>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Enter the verification code sent to your email address.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-[var(--fg)]">
                        Verification Code
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-center text-2xl font-mono tracking-widest text-[var(--fg)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                        disabled={loading || autoVerifying}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || autoVerifying}
                      className="w-full rounded-md bg-[var(--brand)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {loading || autoVerifying ? "Verifying..." : "Verify Email"}
                    </button>
                  </form>

                  <div className="mt-6 border-t border-[var(--border)] pt-4 text-center">
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-sm text-[var(--brand)] hover:underline disabled:opacity-50"
                    >
                      Didn&apos;t receive the code? Resend
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <Link href="/member/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
                      ← Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)]">
        <SiteHeader />
        <div className="pt-[var(--site-header-stack)]">
          <main className="site-container py-16">
            <div className="mx-auto max-w-md">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg text-center">
                <p className="text-[var(--muted)]">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
