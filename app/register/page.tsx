import type { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "@/components/SignUpForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Create account | TTPSSWA",
  description:
    "Create a TTPSSWA website account with your name, work email, service number, and password.",
};

export default function RegisterPage() {
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
              Create an online account
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              Sign up with your name, work email, regiment number, and password.
              Salary deduction and banking details are collected later, after you
              sign in.
            </p>
          </div>
        </div>
        <div className="site-container px-4 py-12 sm:px-6">
          <SignUpForm />
          <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted">
            After you create an account, apply for formal membership at{" "}
            <Link
              href="/services/membership-application"
              className="font-semibold text-brand hover:underline"
            >
              membership application
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
