import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const PARTNERSHIP_CARDS = [
  {
    slug: "hardware-and-beyond",
    label: "Hardware and Beyond",
    description:
      "Hardware supplies and related services for members; further details and offers can be published here as they are finalized.",
  },
  {
    slug: "antar-auto-repairs-and-parts",
    label: "Antar Auto",
    description:
      "Automotive services and member benefits through this subsidiary; information will appear here as programs are confirmed.",
  },
  {
    slug: "dream-builder-colour-studio-ltd",
    label: "Dream Builder Colour Studio Ltd",
    description:
      "Colour and finishing solutions for projects supporting the association’s mission; updates can be added here when available.",
  },
] as const;

export const metadata: Metadata = {
  title: "Partnership | TTPSSWA",
  description:
    "TTPSSWA corporate partners — Hardware and Beyond, Antar Auto, Dream Builder Colour Studio Ltd.",
};

export default function PartnershipPage() {
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
          <div className="relative site-container py-12 sm:py-16">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Partnership</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Choose a partner below to open their profile, offers, and contact details.
            </p>
          </div>
        </section>

        <section
          id="partnership-programs"
          className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-slate-800 bg-slate-950 py-14"
          aria-labelledby="partnership-pillars-heading"
        >
          <div className="site-container">
            <h2
              id="partnership-pillars-heading"
              className="text-xl font-bold tracking-tight text-white md:text-2xl"
            >
              Corporate partners
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400">
              Profiles, offers, and contact details—edit copy anytime as specifics are confirmed.
            </p>
            <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERSHIP_CARDS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/partnership/${p.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-slate-700/80 bg-slate-900/60 px-5 py-6 shadow-sm transition hover:border-sky-500/35 hover:bg-slate-900/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    <span className="text-lg font-semibold text-white group-hover:text-sky-100">{p.label}</span>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>
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
