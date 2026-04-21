import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { MEMBER_BENEFITS, MEMBER_BENEFITS_PILLAR } from "@/lib/member-benefits-data";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description: "Member benefits, grants, and service applications.",
};

export default function MembershipServicesPage() {
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
          <div className="relative site-container py-12 sm:py-16">
            <p className="mb-4">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Membership services</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              {MEMBER_BENEFITS_PILLAR.body}
            </p>
            <div className="mt-10 border-t border-white/10" aria-hidden />
          </div>
        </section>
        <section
          id="members-benefits"
          className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-line bg-navy py-12 text-white"
        >
          <div className="site-container">
            <h2 className="text-center text-2xl font-bold">{MEMBER_BENEFITS_PILLAR.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400">
              Choose a benefit to open the full page with details and application links.
            </p>
            <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {MEMBER_BENEFITS.map((b) => (
                <li key={b.number}>
                  <Link
                    href={`/membership-services/${b.number}`}
                    className="block min-h-[4.25rem] rounded-xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:border-sky-400/35 hover:bg-slate-900/90"
                  >
                    {b.title}
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
