import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const PARTNERSHIP_CARDS = [
  { slug: "hardware-and-beyond", label: "Hardware and Beyond" },
  { slug: "antar-auto-repairs-and-parts", label: "Antar Auto" },
  { slug: "dream-builder-colour-studio-ltd", label: "Dream Builder Colour Studio Ltd" },
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Partnership</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Choose a partner below to open their profile, offers, and contact details.
            </p>
            <div className="mt-10 border-t border-white/10" aria-hidden />
          </div>
        </section>

        <section
          id="partnership-programs"
          className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-line bg-navy py-12 text-white"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERSHIP_CARDS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/partnership/${p.slug}`}
                    className="block min-h-[4.25rem] rounded-xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:border-sky-400/35 hover:bg-slate-900/90"
                  >
                    {p.label}
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
