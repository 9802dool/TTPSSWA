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

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[var(--site-header-stack)]">
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)',
            }}
          />
          <div className="relative site-container py-12 sm:py-16 lg:py-20">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10 lg:gap-14">
              <div className="flex shrink-0 justify-center md:justify-start md:basis-[min(100%,14rem)] lg:basis-[min(100%,16rem)]">
                <Image
                  src="/logo1.png"
                  alt="Trinidad and Tobago Police Service"
                  width={220}
                  height={220}
                  sizes="(max-width: 768px) 40vw, 220px"
                  className="h-auto w-[min(44vw,13rem)] max-w-full object-contain sm:w-[min(36vw,11rem)] md:w-52"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <h1 className="font-bold tracking-tight text-fluid-5xl">
                  <span className="block text-[clamp(0.7rem,2vw,0.85rem)] uppercase tracking-[0.18em] text-sky-200">
                    Trinidad and Tobago Police Service
                  </span>
                  <span className="mt-3 block text-white text-fluid-4xl">Social &amp; Welfare Association</span>
                </h1>
                <p className="mx-auto mt-5 max-w-[min(100%,42rem)] text-[1em] leading-relaxed text-slate-300 md:mx-0">
                  Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
                  executive team.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 md:justify-start">
              <Link
                href="/login"
                className="inline-flex min-h-[2.75rem] min-w-[min(100%,12rem)] flex-1 items-center justify-center rounded-xl bg-gold px-5 py-3 text-center text-sm font-bold text-navy transition hover:opacity-90 sm:min-w-0 sm:flex-initial sm:px-6"
              >
                Become a member
              </Link>
              <Link
                href="/membership-services"
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:flex-initial sm:px-6"
              >
                Membership services
              </Link>
              <Link
                href="/central-committee-representatives"
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:flex-initial sm:px-6"
              >
                Central Committee Reps
              </Link>
              <Link
                href="/committees"
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:flex-initial sm:px-6"
              >
                Committees
              </Link>
              <Link
                href="/rule-book"
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:flex-initial sm:px-6"
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
