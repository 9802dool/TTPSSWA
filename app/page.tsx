import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroVideoSlideshow } from '@/components/HeroVideoSlideshow';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Home | TTPSSWA',
  description:
    'Trinidad and Tobago Police Service Social and Welfare Association — member benefits, executive team, and services.',
  openGraph: {
    title: 'Home | TTPSSWA',
    description: 'Trinidad and Tobago Police Service Social and Welfare Association — member benefits, executive team, and services.',
    url: 'https://ttpsswa.vercel.app',
  },
};

const heroActions = [
  { href: '/become-a-member', label: 'Become a Member', primary: true },
  { href: '/hotel-reservations', label: 'Hotel reservations' },
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
          <h1 className="sr-only">Trinidad and Tobago Police Service Social and Welfare Association</h1>
          <HeroVideoSlideshow />
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
