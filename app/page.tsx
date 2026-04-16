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

const heroCtaSecondary =
  'inline-flex rounded-xl border border-white/90 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6 sm:py-3';

export default function HomePage() {
  return (
    <>
      <SiteHeader variant="home" />
      {/* Promo only: transparent nav sits over hero */}
      <main className="pt-[var(--promo-banner-height)]">
        <section className="relative overflow-hidden border-b border-white/10 bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                'linear-gradient(165deg, rgb(12 25 41) 0%, rgb(20 42 68) 45%, rgb(10 18 30) 100%)',
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-20">
              <div className="flex justify-center lg:justify-start">
                <Image
                  src="/icon.png"
                  alt="TTPSSWA emblem — star, hummingbird, and motto Service Before Self"
                  width={320}
                  height={320}
                  priority
                  className="h-44 w-auto max-w-[min(100%,20rem)] object-contain brightness-0 invert drop-shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:h-52 lg:h-64 xl:h-72"
                />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300 sm:text-base">
                  TRINIDAD AND TOBAGO
                </p>
                <h1 className="mt-2 text-3xl font-bold uppercase leading-[1.08] tracking-tight text-sky-300 sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl">
                  POLICE SERVICE
                </h1>
                <p className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[2.85rem] xl:text-6xl">
                  Social &amp; Welfare Association
                </p>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/95 sm:text-lg lg:mx-0">
                  Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
                  executive team.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3 lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-black shadow-md transition hover:brightness-95 sm:py-3"
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
