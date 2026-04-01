import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CENTRAL_COMMITTEE_REGIONS } from "@/lib/central-committee-regions";

export const metadata: Metadata = {
  title: "Central Committee Representative | TTPSSWA",
  description:
    "Central Committee Representative from all Divisions and Sections. Select a division or section for CC Rep information — TTPSSWA.",
};

export default function CentralCommitteePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-55"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 58 95) 40%, rgb(37 99 235 / 0.35) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex rounded-full border border-brand/45 bg-brand/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Committee
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-sky-50 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
              Central Committee Representative
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-sky-300">
              Central Committee Representative from all Divisions and Sections.
              Select a division or section for CC Rep information.
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-line bg-navy py-16 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 64 175 / 0.22) 55%, rgb(37 99 235 / 0.28) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-sky-200 md:text-3xl">
              Divisions and Sections
            </h2>
            <ul className="mt-10 flex list-none flex-col items-stretch gap-4 p-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              {CENTRAL_COMMITTEE_REGIONS.map((region) => (
                <li key={region.slug}>
                  <Link
                    href={`/central-committee-representatives/${region.slug}`}
                    className="site-btn-committee"
                  >
                    {region.name}
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
