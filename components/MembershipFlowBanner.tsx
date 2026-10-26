import Link from "next/link";

export function MembershipFlowBanner() {
  return (
    <div className="mx-auto max-w-4xl rounded-xl border-2 border-[var(--brand)] bg-white p-6 shadow-sm dark:bg-slate-900">
      <h2 className="text-xl font-bold text-[var(--fg)]">
        Join TTPSSWA - Three Simple Steps
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Step 1 */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
            1
          </div>
          <h3 className="font-semibold text-[var(--fg)]">Create Account</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            First-time members: create your online account
          </p>
          <Link
            href="/register"
            className="mt-3 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
          >
            Register Now →
          </Link>
        </div>

        {/* Step 2 */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
            2
          </div>
          <h3 className="font-semibold text-[var(--fg)]">Submit Application</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Complete your membership application form
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
          >
            Log In & Apply →
          </Link>
        </div>

        {/* Step 3 */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
            3
          </div>
          <h3 className="font-semibold text-[var(--fg)]">Track Status</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            View your application status and updates
          </p>
          <Link
            href="/member/dashboard"
            className="mt-3 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
          >
            My Dashboard →
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Already a member?</strong> Log in to access your dashboard and apply for additional benefits.
        </p>
      </div>
    </div>
  );
}
