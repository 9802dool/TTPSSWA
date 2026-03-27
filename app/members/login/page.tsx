import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Members login | TTPSSWA",
  description: "Member sign-in for TTPSSWA services.",
};

export default function MembersLoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4.25rem)] bg-canvas pt-[4.25rem]">
        <section className="border-b border-line bg-surface py-16 dark:bg-canvas">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Members
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Members login
            </h1>
            <p className="mt-4 text-muted">
              Online member sign-in is not available yet. Please use{" "}
              <Link href="/#contact" className="font-medium text-brand hover:text-brand-hover">
                Contact
              </Link>{" "}
              for membership assistance, or return to{" "}
              <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
                Signup / Login
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
