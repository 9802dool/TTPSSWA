import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const pillars = [
  {
    title: "Members Benefits",
    body:
      "Legal aid, health and education support, housing programs, scholarships, and more—designed to serve members. See Membership services for the full list.",
  },
  {
    title: "Transparency",
    body: "Share updates, reports, or meeting notes so members always know what is happening.",
  },
  {
    title: "Action",
    body: "Describe programs, fundraisers, or partnerships that turn plans into results.",
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
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-[3.25rem]">
              Governance and service for{" "}
              <span className="text-sky-200">TTPSSWA</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300">
              A modern channel for your mission statement, announcements, and member
              communications. Replace placeholder copy in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-slate-200">
                app/page.tsx
              </code>{" "}
              when ready.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-navy shadow-corp-md transition hover:bg-slate-100"
              >
                Contact us
              </a>
              <a
                href="/executive"
                className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-white/30 bg-transparent px-8 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Executive committee
              </a>
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
          id="focus"
          className="scroll-mt-24 border-b border-line bg-canvas py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Strategic focus
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Where we focus
              </h2>
              <p className="mt-4 text-muted">
                Three pillars you can rename—or replace with metrics and partner logos.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 sm:grid-cols-3">
              {pillars.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-xl border border-line bg-surface p-8 shadow-corp transition hover:shadow-corp-md dark:bg-surface"
                >
                  <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-surface py-20 dark:bg-canvas">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Contact
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Get in touch
              </h2>
              <p className="mt-4 text-muted">
                Connect your form service or list official channels below.
              </p>
            </div>
            <div className="mt-10 max-w-lg rounded-xl border border-line bg-canvas p-8 shadow-corp dark:bg-surface">
              <dl className="space-y-6 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Email
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href="mailto:hello@example.com"
                      className="font-medium text-brand hover:text-brand-hover"
                    >
                      hello@example.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Phone
                  </dt>
                  <dd className="mt-1.5 font-medium text-ink">+1 (000) 000-0000</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
