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

        <section className="border-b border-line bg-[#0a0f18] py-14 text-white dark:bg-[#050810]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                Divisions
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Divisions and sections
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Click a pillar to open that division&apos;s page.
              </p>
            </div>
            <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {CENTRAL_COMMITTEE_REGIONS.map((region) => (
                <li key={region.slug}>
                  <Link
                    href={`/central-committee-representatives/${region.slug}`}
                    className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 px-3 py-4 text-center shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-sky-400/40 hover:bg-slate-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    <span className="mb-2 h-1 w-8 shrink-0 rounded-full bg-brand" />
                    <span className="text-sm font-bold leading-snug text-white">
                      {region.name}
                    </span>
                    <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      View
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
