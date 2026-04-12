import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About | TTPSSWA",
  description:
    "About the Trinidad and Tobago Police Service Social & Welfare Association — advocacy, benefits, and community.",
};

export default function AboutPage() {
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About TTPSSWA</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              The Trinidad and Tobago Police Service Social &amp; Welfare Association represents members through advocacy,
              transparent governance, and programs that support officers and their families.
            </p>
          </div>
        </section>
        <section className="border-b border-line bg-[#e8ecf1] py-14 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-ink dark:text-white">Our purpose</h2>
            <p className="mt-4 text-muted dark:text-slate-400">
              We work to strengthen community among members, deliver welfare benefits and services, and uphold professional
              standards in line with association rules and national policy.
            </p>
            <p className="mt-4 text-muted dark:text-slate-400">
              Explore membership, subsidiary locations, and partnership opportunities through the main navigation, or
              contact the association office for more information.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
