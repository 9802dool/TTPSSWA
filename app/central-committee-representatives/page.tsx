import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CENTRAL_COMMITTEE_REGIONS } from "@/lib/central-committee-regions";

export const metadata: Metadata = {
  title: "Central Committee Representative | TTPSSWA",
  description:
    "Central Committee Representative from all Divisions and Sections — TTPSSWA.",
};

export default function CentralCommitteePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[4.25rem]">
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Committee
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]">
              Central Committee Representative
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
              Central Committee Representative from all Divisions and Sections.
              Select a division to view or edit details.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-canvas py-16 dark:bg-canvas">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Divisions
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                Divisions and sections
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Select a card to open that division&apos;s page.
              </p>
            </div>
            <ul className="mt-14 grid list-none gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {CENTRAL_COMMITTEE_REGIONS.map((region) => (
                <li key={region.slug} className="h-full">
                  <Link
                    href={`/central-committee-representatives/${region.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-line bg-surface p-8 shadow-corp outline-none transition hover:border-brand/35 hover:shadow-corp-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:bg-surface"
                  >
                    <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                    <h3 className="text-lg font-bold text-ink transition group-hover:text-brand">
                      {region.name}
                    </h3>
                    <div className="flex-1" aria-hidden />
                    <span className="mt-4 inline-flex text-sm font-semibold text-brand transition group-hover:text-brand-hover">
                      View division →
                    </span>
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
