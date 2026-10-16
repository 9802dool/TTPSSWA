import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Home | TTPSSWA',
  description:
    'Trinidad and Tobago Police Service Social & Welfare Association — member benefits, executive team, and services.',
};

const heroActions = [
  { href: '/become-a-member', label: 'Become a Member', primary: true },
  { href: '/hotel-reservations', label: 'Hotel reservation' },
  { href: '/membership-services', label: 'Membership services' },
  { href: '/central-committee-representatives', label: 'Central Committee Reps' },
  { href: '/committees', label: 'Committees' },
  { href: '/rule-book', label: 'Rule Book' },
] as const;

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
          <div className="relative site-container flex min-h-[22rem] items-center py-16 sm:min-h-[26rem] sm:py-20 lg:min-h-[30rem]">
            <div className="min-w-0 text-center md:text-left">
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
          <nav
            aria-label="Member actions"
            className="relative border-t border-white/15 bg-black/30"
          >
            <div className="site-container flex flex-wrap items-center justify-center gap-2 px-4 py-3 sm:gap-3">
              {heroActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    'primary' in action
                      ? 'inline-flex min-h-10 items-center justify-center rounded-full bg-gold px-4 py-2 text-center text-sm font-bold text-navy transition hover:opacity-90'
                      : 'inline-flex min-h-10 items-center justify-center rounded-full border border-white/25 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/15'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </nav>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
