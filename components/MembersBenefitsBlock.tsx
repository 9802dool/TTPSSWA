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
      <ul className="mt-0 grid list-none gap-6 p-0 sm:max-w-5xl">
        <li className="flex flex-col rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-8">
          <div className="mb-4 h-1 w-10 shrink-0 rounded-full bg-brand" />
          <h3 className="text-lg font-bold text-white">{MEMBER_BENEFITS_PILLAR.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {MEMBER_BENEFITS_PILLAR.body}
          </p>
          <ul
            className="mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-3.5"
            aria-label="Member benefits list"
          >
            {MEMBER_BENEFITS.map((b) => (
              <ExpandableBenefit key={b.number} title={b.title} variant="dark">
                <MemberBenefitDetailsText
                  number={b.number}
                  title={b.title}
                  variant="light"
                />
              </ExpandableBenefit>
            ))}
          </ul>
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
        <ul
          className="mt-6 list-none space-y-2.5 p-0"
          aria-label="Member benefits list"
        >
          {MEMBER_BENEFITS.map((b) => (
            <ExpandableBenefit key={b.number} title={b.title}>
              <MemberBenefitDetailsText number={b.number} title={b.title} />
            </ExpandableBenefit>
          ))}
        </ul>
      </div>
    </div>
  );
}
