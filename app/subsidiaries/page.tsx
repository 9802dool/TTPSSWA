import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Subsidiaries | TTPSSWA",
  description:
    "Subsidiaries and related entities of the Trinidad and Tobago Police Service Social & Welfare Association.",
};

const PILLARS = [
  {
    title: "Hardware and Beyond",
    href: "/subsidiaries/hardware-and-beyond",
    description:
      "Hardware supplies and related services for members; further details and offers can be published here as they are finalized.",
  },
  {
    title: "Antar Auto",
    href: "/subsidiaries/antar-auto",
    description:
      "Automotive services and member benefits through this subsidiary; information will appear here as programs are confirmed.",
  },
  {
    title: "Dream Builders Color Studio",
    href: "/subsidiaries/dream-builders-color-studio",
    description:
      "Colour and finishing solutions for projects supporting the association’s mission; updates can be added here when available.",
  },
] as const;

export default function SubsidiariesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-slate-950 pt-[var(--site-header-stack)] text-slate-100">
        <section className="relative overflow-hidden border-b border-slate-800 bg-navy text-white">
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Subsidiaries</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Information about TTPSSWA subsidiaries and related entities will appear here.
            </p>
          </div>
        </section>
        <section
          id="pillars"
          className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-slate-800 bg-slate-950 py-14"
          aria-labelledby="subsidiaries-pillars-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2
              id="subsidiaries-pillars-heading"
              className="text-xl font-bold tracking-tight text-white md:text-2xl"
            >
              Three pillars
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400">
              TTPSSWA subsidiaries at a glance—edit descriptions anytime as specifics are confirmed.
            </p>
            <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <li key={pillar.title}>
                  <Link
                    href={pillar.href}
                    className="group flex h-full flex-col rounded-xl border border-slate-700/80 bg-slate-900/60 px-5 py-6 shadow-sm transition hover:border-sky-500/35 hover:bg-slate-900/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    <span className="text-lg font-semibold text-white group-hover:text-sky-100">{pillar.title}</span>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
                    <span className="mt-4 text-sm font-medium text-sky-400 group-hover:text-sky-300">
                      View details →
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
