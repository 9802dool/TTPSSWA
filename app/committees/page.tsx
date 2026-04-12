import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Committees | TTPSSWA",
  description: "TTPSSWA committees and subsidiary locations.",
};

export default function CommitteesPage() {
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
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Committees</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Subsidiary locations and related association structures.
            </p>
          </div>
        </section>
        <section className="border-b border-line bg-[#e8ecf1] py-14 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <li>
                <Link
                  href="/beetham-np-service-station"
                  className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                >
                  <h2 className="font-bold text-ink dark:text-white">Beetham NP Service Station</h2>
                  <p className="mt-2 text-sm text-muted dark:text-slate-400">Subsidiary location.</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/laventille-np-service-station"
                  className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                >
                  <h2 className="font-bold text-ink dark:text-white">Laventille NP Service Station</h2>
                  <p className="mt-2 text-sm text-muted dark:text-slate-400">Subsidiary location.</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/noel-chase-hotel-and-conference-centre"
                  className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                >
                  <h2 className="font-bold text-ink dark:text-white">Noel Chase Hotel and Conference Centre</h2>
                  <p className="mt-2 text-sm text-muted dark:text-slate-400">Accommodation and conferences.</p>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
