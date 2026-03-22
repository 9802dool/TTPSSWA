import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description:
    "TTPSSWA membership services — benefits, enrollment, and member support.",
};

const serviceBlocks = [
  {
    title: "Member benefits",
    body: "Summarize insurance, discounts, events, or advocacy your members receive. Replace this text in app/membership-services/page.tsx.",
  },
  {
    title: "Enrollment & renewals",
    body: "Explain how to join, annual fees, and deadlines. Link to PDF forms or an online portal when available.",
  },
  {
    title: "Support & inquiries",
    body: "Direct members to the right contact for billing, ID cards, or general questions.",
  },
];

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
              Resources and information for current and prospective members. Update
              all copy below to match your policies and programs.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-16 dark:bg-canvas">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-6 md:grid-cols-3">
              {serviceBlocks.map((block) => (
                <li
                  key={block.title}
                  className="rounded-xl border border-line bg-canvas p-8 shadow-corp dark:bg-surface"
                >
                  <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                  <h2 className="text-lg font-bold text-ink">{block.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{block.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-canvas py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-muted">
              Questions about membership?{" "}
              <a
                href="/#contact"
                className="font-semibold text-brand hover:text-brand-hover"
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
