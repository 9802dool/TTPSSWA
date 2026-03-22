import type { Metadata } from "next";
import ExpandableBenefit from "@/components/ExpandableBenefit";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description: "TTPSSWA membership services.",
};

const focusPillars = [
  {
    title: "Members Benefits",
    body:
      "These benefits are how we support members: legal aid, optical and dental grants, death and retirement benefits, health plans, education and scholarships, housing and land programs, business promotion, tokens, and more. Open the list below to browse all 19 items; expand any row for details.",
  },
  {
    title: "Transparency",
    body: "Share updates, reports, or meeting notes so members always know what is happening.",
  },
] as const;

const [memberBenefitsPillar, ...otherFocusPillars] = focusPillars;

const memberBenefits: { number: number; title: string }[] = [
  { number: 1, title: "Legal Aid Assistance (Criminal/Disciplinary)" },
  { number: 2, title: "Optical & Dental Grant for SRP's & Municipal" },
  { number: 3, title: "Death Benefit" },
  { number: 4, title: "Guardian Life Health Plan" },
  { number: 5, title: "Retirement Benefit" },
  { number: 6, title: "Merit Facility" },
  { number: 7, title: "Food Hampers, Fruit Baskets" },
  {
    number: 8,
    title: "Financial Assistance for Medical, Natural Disasters etc.",
  },
  { number: 9, title: "Hardware & Beyond home improvement loan facility" },
  { number: 10, title: "Tertiary Education Grant" },
  { number: 11, title: "Full Time Scholarship" },
  { number: 12, title: "Part time Scholarship" },
  { number: 13, title: "SEA Tokens/Awards" },
  { number: 14, title: "Promote and utilizes members businesses" },
  { number: 15, title: "CXC & Cape Tokens" },
  { number: 16, title: "Rent to Own" },
  { number: 17, title: "Land for the Landless" },
  { number: 18, title: "Membership Discount Card" },
  { number: 19, title: "End of Year Membership Token" },
];

function BenefitDetails({ number, title }: { number: number; title: string }) {
  if (number === 1) {
    return (
      <>
        <p className="text-sm font-semibold text-ink">Information</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Describe how members access legal aid for criminal or disciplinary
          matters: eligibility, how to apply, required documents, and office
          contact. Replace this text in{" "}
          <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
            app/membership-services/page.tsx
          </code>
          .
        </p>
      </>
    );
  }
  return (
    <>
      <p className="text-sm font-semibold text-ink">Information</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Add eligibility criteria, how to apply, contacts, and links for{" "}
        <span className="font-medium text-ink">{title}</span>. Edit this block in{" "}
        <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
          app/membership-services/page.tsx
        </code>
        .
      </p>
    </>
  );
}

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

        {/* Dark “Strategic focus” band — matches reference layout */}
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
                Two pillars you can rename—or replace with metrics and partner
                logos.
              </p>
            </div>
            <ul className="mt-14 grid list-none gap-6 p-0 sm:grid-cols-2 sm:items-start">
              <li className="flex flex-col rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-8">
                <div className="mb-4 h-1 w-10 shrink-0 rounded-full bg-brand" />
                <h3 className="text-lg font-bold text-white">
                  {memberBenefitsPillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {memberBenefitsPillar.body}
                </p>
                <details className="mt-6 rounded-xl border border-white/10 bg-black/20 open:[&_summary_.mb-chevron]:rotate-180">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                        All benefits
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        19 items — tap to expand
                      </span>
                    </span>
                    <span
                      className="mb-chevron flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-sky-400 transition-transform duration-200"
                      aria-hidden
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-white/10 px-1 pb-3 pt-2 sm:px-2">
                    <ul
                      className="list-none space-y-2.5 p-0"
                      aria-label="Member benefits (expandable)"
                    >
                      {memberBenefits.map((b) => (
                        <ExpandableBenefit
                          key={b.number}
                          number={b.number}
                          title={b.title}
                        >
                          <BenefitDetails number={b.number} title={b.title} />
                        </ExpandableBenefit>
                      ))}
                    </ul>
                  </div>
                </details>
              </li>
              {otherFocusPillars.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-xl border border-white/10 bg-slate-900/60 p-8 shadow-lg shadow-black/20 backdrop-blur-sm"
                >
                  <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                    {item.body}
                  </p>
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
