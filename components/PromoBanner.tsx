import Link from "next/link";

/** Promotional strip — edit copy and link in this file. */
export function PromoBanner() {
  return (
    <div
      className="flex min-h-[var(--promo-banner-height)] items-center justify-center gap-2 border-b border-white/10 bg-gradient-to-r from-brand via-brand to-indigo-700 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm"
      role="region"
      aria-label="Promotions and announcements"
    >
      <span className="line-clamp-2 sm:line-clamp-none">
        <span className="font-semibold uppercase tracking-wide">Promotion: </span>
        Members save on select services and partner offers — see{" "}
        <Link
          href="/membership-services"
          className="underline decoration-white/80 underline-offset-2 transition hover:text-white hover:decoration-white"
        >
          membership services
        </Link>{" "}
        and{" "}
        <Link
          href="/partnership"
          className="underline decoration-white/80 underline-offset-2 transition hover:text-white hover:decoration-white"
        >
          partnership programs
        </Link>
        .
      </span>
    </div>
  );
}
