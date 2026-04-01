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

  const btnClass = isDark
    ? "site-btn-benefit site-btn-benefit-dark-ring"
    : "site-btn-benefit-light";

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
      <div
        className={
          isDark
            ? "overflow-hidden rounded-xl shadow-lg shadow-blue-950/25"
            : "overflow-hidden rounded-xl shadow-md shadow-slate-900/15"
        }
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`benefit-panel-${benefitKey}`}
          id={`benefit-trigger-${benefitKey}`}
          aria-label={isOpen ? `Hide details for ${title}` : `More information about ${title}`}
          className={btnClass}
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
