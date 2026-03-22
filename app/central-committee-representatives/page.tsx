import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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
              Central Committee Representative from all Divisions and Sections
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-ink md:text-xl">
              Divisions and sections
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Add representative names, roles, and contact details for each division
              or section here. Edit this page in{" "}
              <code className="rounded bg-line/80 px-1.5 py-0.5 text-xs">
                app/central-committee-representatives/page.tsx
              </code>
              .
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Division or section name — representative name & role (placeholder)",
                "Add more rows as needed, or replace this list with cards and photos.",
              ].map((line, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-canvas p-5 text-sm text-muted shadow-corp dark:bg-surface"
                >
                  {line}
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
