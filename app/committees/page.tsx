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
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Committees</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Select a committee to view details. More information can be added for each group as it becomes available.
            </p>
            <div className="mt-10 border-t border-white/10" aria-hidden />
          </div>
        </section>

        <section className="border-b border-line bg-navy py-12 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <CommitteesSection />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
