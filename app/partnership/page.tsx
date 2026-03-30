import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Partnership | TTPSSWA",
  description:
    "TTPSSWA corporate partners and collaborative programs — Hardware and Beyond, Dream Builder Colour Studio Ltd, and more.",
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
          id="partnership-programs"
          className="scroll-mt-24 border-b border-line bg-surface py-12 dark:bg-canvas"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold tracking-tight text-ink md:text-xl">
              Partnership programs
            </h2>
            <p className="mt-2 text-sm text-muted">
              Select a pillar to read more.
            </p>
            <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 sm:items-start sm:gap-6">
              <li className="min-w-0">
                <details
                  id="hardware-and-beyond"
                  className="group rounded-xl border border-line bg-canvas shadow-corp open:[&_summary_.partnership-pillar-chevron]:rotate-180 dark:bg-surface"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-5 text-left transition hover:bg-brand-subtle/30 dark:hover:bg-navy-muted/25 [&::-webkit-details-marker]:hidden sm:px-6 sm:py-6">
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        Partnership pillar
                      </span>
                      <span className="mt-2 block text-xl font-bold tracking-tight text-ink md:text-2xl">
                        Hardware and Beyond
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        Click to open for more information
                      </span>
                    </span>
                    <span
                      className="partnership-pillar-chevron flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-brand transition-transform duration-200"
                      aria-hidden
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-line px-5 pb-6 pt-1 sm:px-6">
                    <p className="text-[17px] leading-relaxed text-muted">
                      Hardware and Beyond is a TTPSSWA partnership program. Further
                      details and contact information will be published here as they
                      become available.
                    </p>
                  </div>
                </details>
              </li>
              <li className="min-w-0">
                <details
                  id="dream-builder-colour-studio-ltd"
                  className="group rounded-xl border border-line bg-canvas shadow-corp open:[&_summary_.partnership-pillar-chevron]:rotate-180 dark:bg-surface"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-5 text-left transition hover:bg-brand-subtle/30 dark:hover:bg-navy-muted/25 [&::-webkit-details-marker]:hidden sm:px-6 sm:py-6">
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        Partnership pillar
                      </span>
                      <span className="mt-2 block text-xl font-bold tracking-tight text-ink md:text-2xl">
                        Dream Builder Colour Studio Ltd
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        Click to open for more information
                      </span>
                    </span>
                    <span
                      className="partnership-pillar-chevron flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-brand transition-transform duration-200"
                      aria-hidden
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-line px-5 pb-6 pt-1 sm:px-6">
                    <p className="text-[17px] leading-relaxed text-muted">
                      Dream Builder Colour Studio Ltd is a TTPSSWA partnership program.
                      Further details and contact information will be published here as
                      they become available.
                    </p>
                  </div>
                </details>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
