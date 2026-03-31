import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const pillars: {
  title: string;
  body?: string;
  href: string;
  linkLabel?: string;
}[] = [
  {
    title: "Noel Chase Hotel and Conference Center Tobago",
    href: "/hotel-reservations",
    linkLabel: "More information →",
  },
  {
    title: "Service Station Beetham Highway",
    href: "/membership-services",
    linkLabel: "More information →",
  },
  {
    title: "Members Benefits",
    href: "/membership-services#members-benefits",
    linkLabel: "All benefits →",
  },
];

const noticeBoardItems: {
  id: string;
  date: string;
  title: string;
  body: string;
}[] = [
  {
    id: "1",
    date: "28 Mar 2026",
    title: "Welcome to the official TTPSSWA site",
    body:
      "This notice board will carry announcements for members. Replace these entries in app/page.tsx when you have updates.",
  },
  {
    id: "2",
    date: "28 Mar 2026",
    title: "Members portal & services",
    body:
      "Use the members portal for login after your application is approved. Membership services and benefits are listed under Members services.",
  },
  {
    id: "3",
    date: "28 Mar 2026",
    title: "Partnership programs",
    body:
      "View our partnership pillars—including Hardware and Beyond and more—on the Partnership page.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        {/* Corporate hero */}
        <section className="relative overflow-hidden border-b border-line bg-navy pt-[var(--site-header-stack)] text-white">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src="/corporate-dark-blue-bg.mp4" type="video/mp4" />
          </video>
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41 / 0.82) 0%, rgb(30 58 95 / 0.75) 45%, rgb(30 64 175 / 0.6) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Official site
            </p>
            <div className="flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/20 shadow-corp sm:h-28 sm:w-28 md:h-32 md:w-32">
                <Image
                  src="/icon1.png"
                  alt="Trinidad and Tobago Police Service Social Welfare Association"
                  fill
                  className="object-contain p-1.5"
                  sizes="(max-width: 640px) 96px, 128px"
                  priority
                />
              </div>
              <h1 className="min-w-0 flex-1 text-balance text-center text-2xl font-bold leading-snug tracking-normal text-white sm:text-left sm:text-3xl sm:leading-[1.3] md:text-4xl md:leading-[1.28] lg:text-[2.65rem] lg:leading-[1.25]">
                Trinidad and Tobago Police Service Social Welfare Association
              </h1>
            </div>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300">
              We are more than an association—we are a family. By providing financial,
              educational, health, and welfare support, we ensure that our members can
              focus on their duty to protect and serve, knowing that their well-being
              and future are secure.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/members-portal"
                className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100 sm:w-auto"
              >
                Access members portal
              </Link>
              <Link
                href="/membership-services"
                className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100 sm:w-auto"
              >
                Members services
              </Link>
              <Link
                href="/hotel-reservations"
                className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100 sm:w-auto"
              >
                Hotel Reservation
              </Link>
              <a
                href="/executive"
                className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100 sm:w-auto"
              >
                Executive Team
              </a>
            </div>
          </div>
        </section>

        <section
          id="notice-board"
          className="scroll-mt-24 border-b border-line bg-gradient-to-b from-amber-50/90 via-surface to-surface py-16 dark:from-slate-900/90 dark:via-canvas dark:to-canvas"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Announcements
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Notice board
              </h2>
              <p className="mt-3 text-muted">
                Official notices and updates for members. Check back periodically for
                new information.
              </p>
            </div>
            <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {noticeBoardItems.map((n) => (
                <li key={n.id}>
                  <article className="relative h-full rounded-xl border border-line bg-surface p-5 shadow-corp transition hover:border-brand/30 hover:shadow-corp-md dark:bg-surface">
                    <span
                      className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 ring-2 ring-surface dark:ring-surface"
                      aria-hidden
                    />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {n.date}
                    </p>
                    <h3 className="mt-3 text-sm font-bold leading-snug text-ink md:text-base">
                      {n.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{n.body}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-b border-line bg-surface py-20 dark:bg-canvas"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
                About Us
              </h2>
              <div className="mt-8 space-y-6 border-t border-line pt-12">
                <p className="text-[17px] leading-[1.75] text-muted">
                  The Trinidad and Tobago Police Service Social and Welfare Association
                  is dedicated to supporting the men and women of the Police Service,
                  Special Reserve Police (SRP), and Municipal Police by enhancing their
                  quality of life and providing meaningful assistance throughout their
                  careers and beyond.
                </p>
                <p className="text-[17px] leading-[1.75] text-muted">
                  We believe that service to country deserves strong support, and our
                  mission is to ensure that every member has access to resources that
                  promote well-being, security, and opportunity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="subsidiaries"
          className="scroll-mt-24 border-b border-line bg-canvas py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Subsidiaries
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Our subsidiaries
              </h2>
              <p className="mt-4 text-muted">
                Three subsidiary areas you can rename—or replace with metrics and
                partner logos.
              </p>
            </div>
            <ul className="mt-14 grid list-none gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {pillars.map((item) => (
                <li key={item.title} className="h-full">
                  <Link
                    href={item.href}
                    className="group flex h-full flex-col rounded-xl border border-line bg-surface p-8 shadow-corp outline-none transition hover:border-brand/35 hover:shadow-corp-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:bg-surface"
                  >
                    <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                    <h3 className="text-lg font-bold text-ink transition group-hover:text-brand">
                      {item.title}
                    </h3>
                    {item.body ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                        {item.body}
                      </p>
                    ) : (
                      <div className="flex-1" aria-hidden />
                    )}
                    <span className="mt-4 inline-flex text-sm font-semibold text-brand transition group-hover:text-brand-hover">
                      {item.linkLabel ?? "More information →"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="partnership"
          className="scroll-mt-24 border-b border-line bg-surface py-20 dark:bg-canvas"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Partnership
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Working together
              </h2>
              <p className="mt-4 text-muted">
                Learn about corporate partners, sponsors, and collaborative programs
                that support our members.
              </p>
              <p className="mt-6">
                <Link
                  href="/partnership"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp transition hover:bg-brand-hover"
                >
                  View partnership programs →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
