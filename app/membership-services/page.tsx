import type { Metadata } from "next";
import Link from "next/link";
import { MembersBenefitsBlock } from "@/components/MembersBenefitsBlock";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
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
              Programs for financial members: benefits overview and links to apply for grants, loans, legal aid, and
              more.
            </p>
          </div>
        </section>
        <section
          id="members-benefits"
          className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-line bg-navy py-14 text-white"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold">Member benefits</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400">
              Expand each item for details and application links.
            </p>
            <div className="mt-10 flex justify-center">
              <MembersBenefitsBlock variant="dark" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
