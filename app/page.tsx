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
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
              <div className="flex shrink-0 justify-center md:justify-start">
                <Image
                  src="/logo1.png"
                  alt="Trinidad and Tobago Police Service"
                  width={220}
                  height={220}
                  className="h-auto w-36 object-contain sm:w-44 md:w-52"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  <span className="block uppercase tracking-[0.2em] text-sky-200">
                    Trinidad and Tobago Police Service
                  </span>
                  <span className="mt-3 block text-white">Social &amp; Welfare Association</span>
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300 md:mx-0">
                  Advocacy, benefits, and community for officers. Apply online, explore member services, and meet the
                  executive team.
                </p>
              </div>
            </div>
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
                Central committee
              </Link>
              <Link
                href="/beetham-np-service-station"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Beetham NP Service Station
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
