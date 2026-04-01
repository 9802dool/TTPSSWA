"use client";

type Props = {
  title: string;
  benefitKey: number;
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  /** Dark page background (membership-services). */
  variant?: "light" | "dark";
};

export default function ExpandableBenefit({
  title,
  benefitKey,
  isOpen,
  onToggle,
  children,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";

  const shell =
    isDark
      ? "group overflow-hidden rounded-md border-2 border-white/35 bg-brand shadow-corp-md"
      : "overflow-hidden rounded-md border-2 border-brand/40 bg-brand shadow-corp-md";
  const btnBase =
    isDark
      ? "flex w-full min-h-[48px] items-center gap-3 px-4 text-left text-white transition hover:bg-brand-hover sm:px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18]"
      : "flex w-full min-h-[48px] items-center gap-3 px-4 py-3 text-left text-white transition hover:bg-brand-hover sm:px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
  const titleCls =
    isDark
      ? "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-white"
      : "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-white sm:text-base";
  const panel =
    isDark
      ? "border-t border-white/20 bg-slate-50 px-4 py-5 sm:px-8"
      : "border-t border-white/20 bg-slate-50 px-4 py-5 sm:px-8";

  return (
    <li className={isDark ? "h-full" : undefined}>
      <div className={shell}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`benefit-panel-${benefitKey}`}
          id={`benefit-trigger-${benefitKey}`}
          aria-label={isOpen ? `Hide details for ${title}` : `More information about ${title}`}
          className={btnBase}
        >
          <span className={titleCls}>{title}</span>
        </button>
        {isOpen && (
          <div
            id={`benefit-panel-${benefitKey}`}
            role="region"
            aria-labelledby={`benefit-trigger-${benefitKey}`}
            aria-label={`Details for ${title}`}
          >
            <div className={panel}>
              {children ?? (
                <p className="text-sm leading-relaxed text-muted">
                  Add details, contacts, and links here.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
