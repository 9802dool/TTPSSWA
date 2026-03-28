import ExpandableBenefit from "@/components/ExpandableBenefit";
import { MemberBenefitDetailsText } from "@/components/MemberBenefitDetailsText";
import {
  MEMBER_BENEFITS,
  MEMBER_BENEFITS_PILLAR,
} from "@/lib/member-benefits-data";

/** Member benefits list for the home page Members services section. */
export function MembersBenefitsBlock() {
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
