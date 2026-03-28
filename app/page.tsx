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

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        {/* Corporate hero */}
        <section className="relative overflow-hidden border-b border-line bg-navy pt-[4.25rem] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 45%, rgb(30 64 175 / 0.35) 100%)",
            }}
          />
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand/20 blur-3xl" aria-hidden />
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
              A modern channel for your mission statement, announcements, and member
              communications. Replace placeholder copy in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-slate-200">
                app/page.tsx
              </code>{" "}
              when ready.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
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
              <Link
                href="/central-committee-representatives"
                className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-md bg-white px-4 text-center text-sm font-semibold leading-snug text-navy shadow-corp-md transition hover:bg-slate-100 sm:w-auto sm:px-8"
              >
                Central Committee Representative
              </Link>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-b border-line bg-surface py-20 dark:bg-canvas"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                About
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Who we are
              </h2>
              <p className="mt-4 text-muted">
                A concise introduction visitors see first—edit to match your charter.
              </p>
            </div>
            <div className="mt-12 grid gap-10 border-t border-line pt-12 md:grid-cols-2 md:gap-16">
              <p className="text-[17px] leading-[1.75] text-muted">
                Replace this paragraph with your organization’s story—who you serve,
                when you were founded, and what success looks like for your members.
              </p>
              <p className="text-[17px] leading-[1.75] text-muted">
                Add a second column for milestones, leadership, or a short timeline.
                Short sections scan well on mobile and desktop.
              </p>
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
                Add details about corporate partners, sponsors, and collaborative
                programs—edit this copy in{" "}
                <code className="rounded bg-brand-subtle px-1.5 py-0.5 text-sm text-slate-700 dark:bg-navy-muted dark:text-slate-200">
                  app/page.tsx
                </code>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
