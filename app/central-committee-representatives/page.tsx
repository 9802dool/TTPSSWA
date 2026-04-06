import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CENTRAL_COMMITTEE_REGIONS } from "@/lib/central-committee-regions";

export const metadata: Metadata = {
  title: "Central Committee Representatives | TTPSSWA",
  description: "Regional representatives across divisions — contact and roster by area.",
};

export default function CentralCommitteeIndexPage() {
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Central Committee representatives
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Choose a division or section to view the representative profile and contact details.
            </p>
          </div>
        </section>
        <section className="border-b border-line bg-[#e8ecf1] py-12 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CENTRAL_COMMITTEE_REGIONS.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/central-committee-representatives/${r.slug}`}
                    className="block rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
