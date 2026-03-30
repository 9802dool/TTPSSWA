import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Partnership | TTPSSWA",
  description:
    "TTPSSWA corporate partners and collaborative programs — including Hardware and Beyond.",
};

export default function PartnershipPage() {
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
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Partnership
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Working together
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Corporate partners, sponsors, and collaborative programs that support
              TTPSSWA members.
            </p>
          </div>
        </section>

        <section
          id="hardware-and-beyond"
          className="scroll-mt-24 border-b border-line bg-surface py-12 dark:bg-canvas"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Hardware and Beyond
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              Hardware and Beyond is a TTPSSWA partnership program. Further details and
              contact information will be published here as they become available.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
