import type { Metadata } from "next";
import Link from "next/link";
import { CommitteesSection } from "@/components/CommitteesSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Committees | TTPSSWA",
  description: "TTPSSWA committees — Education, Events, Welfare, and more.",
};

export default function CommitteesPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="bg-canvas py-12 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6">
              <Link
                href="/"
                className="inline-flex text-sm font-bold text-navy underline-offset-4 transition hover:text-brand hover:underline dark:text-sky-200 dark:hover:text-white"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-sky-100 md:text-4xl">Committees</h1>
            <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed text-navy dark:text-sky-100">
              Select a committee to view details. More information can be added for each group as it becomes available.
            </p>
            <div className="mt-12">
              <CommitteesSection />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
