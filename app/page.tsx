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

/** Matches screenshot: transparent fill, white border, white label */
const heroCtaSecondary =
  'inline-flex rounded-full border border-white/85 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6 sm:py-3';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="relative flex min-h-[calc(100dvh-var(--site-header-stack))] flex-col overflow-hidden border-b border-white/25 bg-home-hero text-white">
          <div className="relative flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12 xl:gap-16">
                <div className="flex justify-center lg:justify-start">
                  <Image
                    src="/icon.png"
                    alt="TTPSSWA emblem — star, hummingbird, and motto Service Before Self"
                    width={320}
                    height={320}
                    priority
                    className="h-52 w-auto max-w-[min(100%,19rem)] object-contain brightness-0 invert drop-shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:h-60 lg:h-[18rem] xl:h-[19rem]"
                  />
                </div>
                <div className="text-center lg:text-left">
                  {/* Three lines per reference PNG */}
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-headline sm:text-base">
                    TRINIDAD AND TOBAGO
                  </p>
                  <p className="mt-2 text-2xl font-bold uppercase leading-tight tracking-[0.06em] text-home-headline sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-5xl">
                    POLICE SERVICE
                  </p>
                  <p className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl">
                    Social &amp; Welfare Association
                  </p>
                  <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-relaxed text-white sm:text-lg lg:mx-0">
                    Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
                    executive team.
                  </p>
                  <div className="mt-9 flex flex-wrap justify-center gap-2.5 sm:mt-10 sm:gap-3 lg:justify-start">
                    <Link
                      href="/login"
                      className="inline-flex rounded-full bg-home-gold px-6 py-2.5 text-sm font-bold text-black shadow-md transition hover:brightness-95 sm:py-3"
                    >
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
