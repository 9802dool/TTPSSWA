import type { Metadata } from "next";
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
          </div>
        </section>

        <section
          className="border-b border-line bg-surface py-12 dark:bg-canvas"
          aria-label="Membership content"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Member benefits
            </h2>
            <ul className="mt-8 list-none space-y-3 p-0">
              <li>
                <div className="flex gap-4 rounded-lg border border-line bg-canvas px-4 py-4 shadow-corp dark:bg-surface">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">
                    1
                  </span>
                  <span className="min-w-0 flex-1 pt-1 text-base font-bold leading-snug text-ink">
                    Legal Aid Assistance (Criminal/Disciplinary)
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
