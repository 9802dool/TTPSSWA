import Link from "next/link";

function MarqueeSegment({ duplicate = false }: { duplicate?: boolean }) {
  const partnerLink = duplicate ? (
    <span className="opacity-90">Partner info</span>
  ) : (
    <Link
      href="/partnership#dream-builder-colour-studio-ltd"
      className="shrink-0 underline decoration-white/80 underline-offset-2 transition hover:text-white hover:decoration-white"
    >
      Partner info
    </Link>
  );

  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-10 sm:px-14">
      <span className="font-semibold">Dream Builder Colour Studio Ltd</span>
      <span>— TTPSSWA partnership</span>
      <span className="hidden sm:inline">
        Member promotions and colour & design services
      </span>
      {partnerLink}
      <span aria-hidden className="text-white/50">
        ·
      </span>
    </span>
  );
}

/** Promotional strip — looping Dream Builder Colour Studio Ltd (edit in this file). */
export function PromoBanner() {
  return (
    <div
      className="flex min-h-[var(--promo-banner-height)] items-center border-b border-white/10 bg-gradient-to-r from-brand via-brand to-indigo-700 py-1.5 text-xs font-medium text-white sm:text-sm"
      role="region"
      aria-label="Promotions: Dream Builder Colour Studio Ltd partnership"
    >
      <div className="relative w-full overflow-hidden">
        <div className="promo-marquee-animate flex w-max motion-reduce:w-full motion-reduce:animate-none motion-reduce:justify-center">
          <MarqueeSegment />
          <span className="motion-reduce:hidden">
            <MarqueeSegment duplicate />
          </span>
        </div>
      </div>
    </div>
  );
}
