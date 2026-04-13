import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Home | TTPSSWA',
  description:
    'Trinidad and Tobago Police Service Social & Welfare Association — member benefits, executive team, and services.',
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="relative mx-auto flex min-h-[28rem] w-full max-w-[1920px] flex-col justify-center overflow-hidden border-b border-line bg-navy text-white sm:min-h-[34rem] md:min-h-[42rem] lg:aspect-video lg:min-h-0">
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          >
            <source src="/homepage-add.mp4" type="video/mp4" />
          </video>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-navy/80 via-navy/55 to-[rgb(30_58_95)]/50"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-slate-300 md:mx-0 md:text-left">
              Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
              executive team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Link
                href="/login"
                className="inline-flex rounded-xl bg-gold px-6 py-3 text-sm font-bold text-navy transition hover:opacity-90"
              >
                Become a member
              </Link>
              <Link
                href="/membership-services"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Membership services
              </Link>
              <Link
                href="/central-committee-representatives"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Central Committee Reps
              </Link>
              <Link
                href="/committees"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Committees
              </Link>
              <Link
                href="/rule-book"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Rule Book
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
