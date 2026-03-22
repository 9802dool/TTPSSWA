import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  TTPS_STATIONS_SOURCE,
  ttpsDivisions,
} from "@/lib/ttps-police-stations";

export const metadata: Metadata = {
  title: "Central Committee Representative | TTPSSWA",
  description:
    "TTPSSWA — TTPS police stations by division (reference from TTPS).",
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
              Reference
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]">
              Central Committee Representative
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
              Police stations and posts across Trinidad and Tobago by division,
              reproduced from the{" "}
              <a
                href={TTPS_STATIONS_SOURCE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-200 underline underline-offset-2 hover:text-white"
              >
                Trinidad &amp; Tobago Police Service
              </a>{" "}
              contact listing. Emergency:{" "}
              <span className="font-medium text-white">999</span>. Crime Stoppers:{" "}
              <span className="font-medium text-white">555</span>. Confirm
              addresses and numbers on the official site before relying on them.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-ink md:text-xl">
              Police stations by division
            </h2>
            <p className="mt-2 text-sm text-muted">
              Source:{" "}
              <a
                href={TTPS_STATIONS_SOURCE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand hover:text-brand-hover"
              >
                ttps.gov.tt/contact/stations/
              </a>
            </p>

            <div className="mt-12 space-y-16">
              {ttpsDivisions.map((div) => (
                <div
                  key={div.name}
                  id={div.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")}
                  className="scroll-mt-28"
                >
                  <h3 className="border-b border-line pb-3 text-base font-bold text-ink md:text-lg">
                    {div.name}
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({div.summary})
                    </span>
                  </h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {div.stations.map((s) => (
                      <article
                        key={`${div.name}-${s.name}-${s.address}`}
                        className="rounded-xl border border-line bg-canvas p-5 shadow-corp dark:bg-surface"
                      >
                        <h4 className="text-sm font-bold text-ink md:text-base">
                          {s.name}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {s.address}
                        </p>
                        <p className="mt-3 text-sm">
                          <span className="text-muted">Phone: </span>
                          <span className="font-semibold text-ink">{s.phones}</span>
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
