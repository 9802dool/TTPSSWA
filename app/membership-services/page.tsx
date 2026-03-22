import type { Metadata } from "next";
import ExpandableBenefit from "@/components/ExpandableBenefit";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description: "TTPSSWA membership services.",
};

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

        <section
          className="border-b border-line bg-surface py-12 dark:bg-canvas"
          aria-label="Membership content"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Member benefits
            </h2>
            <p className="mt-2 text-sm text-muted">
              Click a benefit to open details (1–19).
            </p>
            <ul className="mt-6 list-none space-y-3 p-0">
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
