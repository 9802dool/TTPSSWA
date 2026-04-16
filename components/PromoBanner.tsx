function MarqueeSegment({ duplicate = false }: { duplicate?: boolean }) {
  const phoneDisplay = "1 868-778-3039";
  const phone = duplicate ? (
    <span className="whitespace-nowrap">{phoneDisplay}</span>
  ) : (
    <a
      href="tel:+18687783039"
      className="whitespace-nowrap font-semibold underline decoration-white/80 underline-offset-2 transition hover:text-white hover:decoration-white"
    >
      {phoneDisplay}
    </a>
  );

  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap px-10 sm:px-14">
      <span>
        Dream Builder Colour Studio Ltd is offering all members of the Association{" "}
        from 5 to 20% discount on paints and other building supplies. For more info
        call {phone}
      </span>
      <span aria-hidden className="pl-3 text-white/50">
        ·
      </span>
    </span>
  );
}

/** Promotional strip — looping Dream Builder offer (edit copy in this file). */
export function PromoBanner() {
  return (
    <div
      className="flex min-h-[var(--promo-banner-height)] items-center border-b border-white/10 bg-navy py-1.5 text-xs font-medium text-white sm:text-sm"
      role="region"
      aria-label="Promotion: Dream Builder Colour Studio Ltd member discount on paints and building supplies"
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
