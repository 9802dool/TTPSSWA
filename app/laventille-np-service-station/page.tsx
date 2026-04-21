import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Laventille NP Service Station | TTPSSWA",
  description: "TTPSSWA subsidiary — Laventille NP Service Station.",
};

export default function LaventilleNpServiceStationPage() {
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
          <div className="relative site-container py-14 sm:py-20">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Laventille NP Service Station</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              TTPSSWA subsidiary location. Member offers and information will be posted here as they become available.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
