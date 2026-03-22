import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership services | TTPSSWA",
  description:
    "TTPSSWA membership services — benefits, enrollment, and member support.",
};

const benefits: { id: number; title: string }[] = [
  { id: 1, title: "Legal Aid Assistance (Criminal/Disciplinary)" },
  { id: 2, title: "Optical & Dental Grant for SRP's & Municipal" },
  { id: 3, title: "Death Benefit" },
  { id: 4, title: "Guardian Life Health Plan" },
  { id: 5, title: "Retirement Benefit" },
  { id: 6, title: "Merit Facility" },
  { id: 7, title: "Food Hampers, Fruit Baskets" },
  {
    id: 8,
    title: "Financial Assistance for Medical, Natural Disasters etc.",
  },
  { id: 9, title: "Hardware & Beyond home improvement loan facility" },
  { id: 10, title: "Tertiary Education Grant" },
  { id: 11, title: "Full Time Scholarship" },
  { id: 12, title: "Part time Scholarship" },
  { id: 13, title: "SEA Tokens/Awards" },
  { id: 14, title: "Promote and utilizes members businesses" },
  { id: 15, title: "CXC & Cape Tokens" },
  { id: 16, title: "Rent to Own" },
  { id: 17, title: "Land for the Landless" },
  { id: 18, title: "Membership Discount Card" },
  { id: 19, title: "End of Year Membership Token" },
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
              Use Select benefits to choose a program—each link jumps to full details
              on the same page.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Member benefits
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Select benefits
            </p>
            <p className="mt-3 text-sm text-muted">
              Click a benefit to jump to its details. Replace placeholders with your
              policy text, download links, or application forms.
            </p>
            <ul className="mt-8 list-none space-y-2 p-0">
              {benefits.map((b) => (
                <li key={b.id}>
                  <a
                    href={`#benefit-${b.id}`}
                    className="group flex gap-4 rounded-lg border border-line bg-canvas px-4 py-3.5 shadow-corp transition hover:border-brand hover:bg-brand-subtle dark:bg-surface"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white group-hover:bg-brand">
                      {b.id}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5 text-sm font-bold leading-snug text-ink group-hover:text-brand md:text-base">
                      {b.title}
                    </span>
                    <span
                      className="hidden shrink-0 self-center text-xs font-semibold text-brand group-hover:inline sm:inline"
                      aria-hidden
                    >
                      View →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-12 space-y-0 border-t border-line pt-10">
              {benefits.map((b) => (
                <article
                  key={b.id}
                  id={`benefit-${b.id}`}
                  className="scroll-mt-28 border-t border-line py-10 first:border-t-0 first:pt-0"
                >
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
                      {b.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-ink md:text-lg">
                        {b.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        Add eligibility criteria, contacts, and links here. You can
                        also point a list row to an external PDF by changing{" "}
                        <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
                          href
                        </code>{" "}
                        for that item in{" "}
                        <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
                          membership-services/page.tsx
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
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
