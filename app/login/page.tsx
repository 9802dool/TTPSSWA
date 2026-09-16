import type { Metadata } from "next";
import Link from "next/link";
import { MembersLoginForm } from "@/components/MembersLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Sign in | TTPSSWA",
  description: "Sign in to your TTPSSWA web account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const registered = searchParams.registered === "true";
  const rawNext = searchParams.next;
  const nextPath =
    typeof rawNext === "string"
      ? rawNext
      : registered
        ? "/services/membership-application"
        : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="site-container">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sign in
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Use your work email or regiment number and password. New here?{" "}
              <Link href="/register" className="font-semibold text-brand hover:underline">
                Create an online account
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
          {registered ? (
            <p
              className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              role="status"
            >
              Account created. Sign in to continue with formal membership and salary
              deduction, if you wish.
            </p>
          ) : null}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <MembersLoginForm redirectAfterLogin={nextPath ?? null} />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Formal membership application:{" "}
            <Link
              href="/services/membership-application"
              className="font-semibold text-brand hover:underline"
            >
              salary deduction authorization
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
