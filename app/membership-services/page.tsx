import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description: "TTPSSWA membership services.",
};

export default function MembershipServicesPage() {
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
              Members
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Membership services
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              The full{" "}
              <strong className="font-semibold text-white">Members Benefits</strong>{" "}
              list with all 19 items now lives on the home page under{" "}
              <strong className="font-semibold text-white">Members services</strong>, so
              visitors can browse benefits next to login and application links.
            </p>
            <div className="mt-8">
              <Link
                href="/#members-benefits"
                className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100"
              >
                Open member benefits
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-[#0a0f18] py-20 text-white dark:bg-[#050810]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                Strategic focus
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Where we focus
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Replace this band with metrics, partner logos, or subsidiary highlights
                when ready.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
