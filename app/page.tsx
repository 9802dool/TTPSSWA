import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExecutiveTeamGrid } from '@/components/ExecutiveTeamGrid';
import { MembersBenefitsBlock } from '@/components/MembersBenefitsBlock';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Home | TTPSSWA',
  description:
    'Trinidad and Tobago Police Service Social & Welfare Association — member benefits, executive team, and services.',
};

type HomePageProps = {
  searchParams: { tab?: string | string[] };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const raw = searchParams.tab;
  const servicesRequested =
    raw === 'services' ||
    raw === 'overview' ||
    (Array.isArray(raw) &&
      (raw.includes('services') || raw.includes('overview')));
  /** Default home (`/`) shows Executive; services use `/?tab=services`. */
  const tab = servicesRequested ? 'overview' : 'executive';

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
                href="/hotel-reservations"
                className="inline-flex rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Hotel reservations
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

        {tab === 'overview' ? (
          <>
            <section
              id="subsidiaries"
              className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-line bg-[#e8ecf1] py-14 dark:bg-slate-900"
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-2xl font-bold text-ink dark:text-white">
                  Subsidiaries &amp; services
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted dark:text-slate-400">
                  Hotel reservations, membership benefits, salary deduction, and more.
                </p>
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <li>
                    <Link
                      href="/hotel-reservations"
                      className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                    >
                      <h3 className="font-bold text-ink dark:text-white">Hotel reservations</h3>
                      <p className="mt-2 text-sm text-muted dark:text-slate-400">
                        Book association accommodations.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/membership-services"
                      className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                    >
                      <h3 className="font-bold text-ink dark:text-white">Membership services</h3>
                      <p className="mt-2 text-sm text-muted dark:text-slate-400">
                        Benefits, grants, and applications.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/central-committee-representatives"
                      className="block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-950"
                    >
                      <h3 className="font-bold text-ink dark:text-white">Central committee</h3>
                      <p className="mt-2 text-sm text-muted dark:text-slate-400">Regional representatives.</p>
                    </Link>
                  </li>
                </ul>
              </div>
            </section>

            <section
              id="members-benefits"
              className="scroll-mt-[calc(var(--site-header-stack)+0.5rem)] border-b border-line bg-navy py-14 text-white"
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-2xl font-bold">Member benefits</h2>
                <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400">
                  Programs and support available to financial members.
                </p>
                <div className="mt-10 flex justify-center">
                  <MembersBenefitsBlock variant="dark" />
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="border-b border-line bg-slate-200 py-14 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-2xl font-bold text-ink dark:text-white">Executive team</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted dark:text-slate-400">
                National officers and leadership.
              </p>
              <div className="mt-10">
                <ExecutiveTeamGrid />
              </div>
              <p className="mt-8 text-center">
                <Link
                  href="/executive"
                  className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  Full executive page →
                </Link>
              </p>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
