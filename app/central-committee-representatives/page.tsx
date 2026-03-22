import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "CENTRAL COMMITTEE REPRESENTATIVES | TTPSSWA",
  description:
    "TTPSSWA central committee representatives — regional and division liaisons.",
};

const placeholderRows = [
  "Representative role or division (add names and photos in this file).",
  "Duplicate or remove rows to match your roster.",
  "Each line can be replaced with a full card grid when you are ready.",
];

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
              Governance
            </p>
            <h1 className="text-2xl font-bold tracking-wide sm:text-3xl md:text-4xl lg:text-5xl">
              CENTRAL COMMITTEE REPRESENTATIVES
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Use this page to list representatives by region, station, or committee.
              Edit copy and layout in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-slate-200">
                app/central-committee-representatives/page.tsx
              </code>
              .
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-16 dark:bg-canvas">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="space-y-4">
              {placeholderRows.map((line, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-canvas p-6 text-sm text-muted shadow-corp dark:bg-surface"
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
