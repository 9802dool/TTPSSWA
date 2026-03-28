import ExpandableBenefit from "@/components/ExpandableBenefit";
import { MemberBenefitDetailsText } from "@/components/MemberBenefitDetailsText";
import {
  MEMBER_BENEFITS,
  MEMBER_BENEFITS_PILLAR,
} from "@/lib/member-benefits-data";

type Variant = "light" | "dark";

export function MembersBenefitsBlock({ variant = "light" }: { variant?: Variant }) {
  if (variant === "dark") {
    return (
      <ul className="mt-0 grid list-none gap-6 p-0 sm:max-w-3xl">
        <li className="flex flex-col rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-8">
          <div className="mb-4 h-1 w-10 shrink-0 rounded-full bg-brand" />
          <h3 className="text-lg font-bold text-white">{MEMBER_BENEFITS_PILLAR.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {MEMBER_BENEFITS_PILLAR.body}
          </p>
          <details className="mt-6 rounded-xl border border-white/10 bg-black/20 open:[&_summary_.mb-chevron]:rotate-180">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition hover:bg-white/5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                  All benefits
                </span>
                <span className="mt-1 block text-xs text-slate-500">19 items</span>
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
                aria-label="Member benefits list"
              >
                {MEMBER_BENEFITS.map((b) => (
                  <ExpandableBenefit
                    key={b.number}
                    number={b.number}
                    title={b.title}
                  >
                    <MemberBenefitDetailsText number={b.number} title={b.title} />
                  </ExpandableBenefit>
                ))}
              </ul>
            </div>
          </details>
        </li>
      </ul>
    );
  }

  return (
    <div className="mt-10 max-w-3xl">
      <div className="rounded-xl border border-line bg-canvas p-6 shadow-corp dark:bg-surface sm:p-8">
        <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
        <h3 className="text-lg font-bold text-ink">{MEMBER_BENEFITS_PILLAR.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {MEMBER_BENEFITS_PILLAR.body}
        </p>
        <details className="mt-6 rounded-xl border border-line bg-surface open:[&_summary_.mb-chevron-light]:rotate-180 dark:bg-canvas/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition hover:bg-brand-subtle/40 dark:hover:bg-navy-muted/30 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-brand">
                All benefits
              </span>
              <span className="mt-1 block text-xs text-muted">19 items</span>
            </span>
            <span
              className="mb-chevron-light flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-brand transition-transform duration-200"
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
          <div className="border-t border-line px-1 pb-3 pt-2 sm:px-2">
            <ul
              className="list-none space-y-2.5 p-0"
              aria-label="Member benefits list"
            >
              {MEMBER_BENEFITS.map((b) => (
                <ExpandableBenefit
                  key={b.number}
                  number={b.number}
                  title={b.title}
                >
                  <MemberBenefitDetailsText number={b.number} title={b.title} />
                </ExpandableBenefit>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
