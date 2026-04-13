import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hardware and Beyond | TTPSSWA",
  description: "TTPSSWA subsidiary — Hardware and Beyond.",
};

export default function HardwareAndBeyondPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-slate-950 pt-[var(--site-header-stack)] text-slate-100">
        <section className="relative overflow-hidden border-b border-slate-800 bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                href="/"
                className="inline-flex font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Home
              </Link>
              <Link
                href="/subsidiaries"
                className="inline-flex font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Subsidiaries
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hardware and Beyond</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Hardware supplies and related services for members. Further details and offers will be posted here as they
              become available.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
