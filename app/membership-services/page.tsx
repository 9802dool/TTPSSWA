import type { Metadata } from "next";
import MembershipBenefitsPanel from "@/components/MembershipBenefitsPanel";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/** Avoid stale HTML from edge/CDN after deploys */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description:
    "TTPSSWA membership services — benefits, enrollment, and member support.",
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
              Open <strong className="font-bold text-white">Select benefits</strong>{" "}
              to view the list, benefit information, and full details for each
              program.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <MembershipBenefitsPanel />
        </section>

        <section className="border-t border-line bg-surface py-16 dark:bg-canvas">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-muted">
              Questions about membership?{" "}
              <a
                href="/#contact"
                className="font-bold text-brand hover:text-brand-hover"
              >
                Contact the office
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
