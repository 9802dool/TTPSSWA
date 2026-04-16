import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Home | TTPSSWA',
  description:
    'Trinidad and Tobago Police Service Social & Welfare Association — member benefits, executive team, and services.',
};

/** One size for all three headline lines; colour only differs */
const headlineLine =
  'text-[clamp(1rem,2.8vw,1.35rem)] font-bold leading-snug sm:text-xl md:text-2xl lg:text-[1.35rem] xl:text-2xl';

const heroCtaSecondary =
  'inline-flex shrink-0 items-center justify-center rounded-full border border-white/85 bg-transparent px-2.5 py-2 text-[0.65rem] font-semibold text-white transition hover:bg-white/10 sm:px-3 sm:text-xs md:px-3.5 md:text-sm lg:px-4';

const heroCtaPrimary =
  'inline-flex shrink-0 items-center justify-center rounded-full bg-home-gold px-2.5 py-2 text-[0.65rem] font-bold text-black shadow-md transition hover:brightness-95 sm:px-3 sm:text-xs md:px-3.5 md:text-sm lg:px-4';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="relative flex min-h-[calc(100dvh-var(--site-header-stack))] flex-col overflow-hidden border-b border-white/25 bg-home-hero text-white">
          <div className="relative flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
              {/* Logo + copy one horizontal band; text sits beside logo from lg up */}
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-12">
                <div className="flex shrink-0 justify-center lg:justify-start">
                  <Image
                    src="/icon.png"
                    alt="TTPSSWA emblem — star, hummingbird, and motto Service Before Self"
                    width={320}
                    height={320}
                    priority
                    className="h-44 w-auto max-w-[16rem] object-contain brightness-0 invert drop-shadow-[0_12px_40px_rgba(0,0,0,0.4)] sm:h-52 lg:h-[15.5rem] xl:h-[17rem]"
                  />
                </div>
                <div className="min-w-0 flex-1 text-center lg:text-left">
                  <p className={`${headlineLine} uppercase tracking-[0.12em] text-home-headline`}>
                    TRINIDAD AND TOBAGO
                  </p>
                  <p className={`${headlineLine} mt-1 uppercase tracking-[0.08em] text-home-headline`}>
                    POLICE SERVICE
                  </p>
                  <p className={`${headlineLine} mt-1 text-white`}>Social &amp; Welfare Association</p>
                  <p className="mx-auto mt-5 max-w-xl text-sm font-normal leading-relaxed text-white sm:text-base lg:mx-0">
                    Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
                    executive team.
                  </p>
                  {/* Single row: nowrap + compact padding; scroll on very small viewports */}
                  <div className="mt-7 flex w-full min-w-0 flex-nowrap items-stretch justify-center gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] sm:gap-2 lg:justify-start">
                    <Link href="/login" className={heroCtaPrimary}>
                      Become a member
                    </Link>
                    <Link href="/membership-services" className={heroCtaSecondary}>
                      Membership services
                    </Link>
                    <Link href="/central-committee-representatives" className={heroCtaSecondary}>
                      Central Committee Reps
                    </Link>
                    <Link href="/committees" className={heroCtaSecondary}>
                      Committees
                    </Link>
                    <Link href="/rule-book" className={heroCtaSecondary}>
                      Rule Book
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
