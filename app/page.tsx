import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const pillars = [
  {
    title: "Community",
    body: "Highlight how your group brings people together—events, outreach, or mutual support.",
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
        <section className="relative overflow-hidden border-b border-stone-200/80 pt-24 dark:border-stone-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(13 92 92 / 0.25), transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-16 lg:px-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Welcome
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl">
              A clear home for{" "}
              <span className="text-accent">TTPSSWA</span> online
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              This site is ready for your mission statement, announcements, and
              contact details. Edit the copy in{" "}
              <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-sm dark:bg-stone-800">
                app/page.tsx
              </code>{" "}
              and deploy to Vercel, Netlify, or any Node host.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-[var(--accent)] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] dark:text-stone-950"
              >
                Get in touch
              </a>
              <a
                href="#about"
                className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-stone-300 bg-surface px-8 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent dark:border-stone-600"
              >
                Learn more
              </a>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-20 border-b border-stone-200/80 py-20 dark:border-stone-800"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
              About
            </h2>
            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-accent to-transparent" />
            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
              <p className="text-[17px] leading-[1.75] text-muted">
                Replace this paragraph with your organization’s story—who you serve,
                when you were founded, and what success looks like for your members.
              </p>
              <p className="text-[17px] leading-[1.75] text-muted">
                Add a second column for milestones, leadership, or a short timeline.
                Keeping sections short helps visitors scan on phones and desktops.
              </p>
            </div>
          </div>
        </section>

        <section
          id="focus"
          className="scroll-mt-20 border-b border-stone-200/80 bg-surface/60 py-20 dark:bg-stone-900/40 dark:border-stone-800"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
              Where we focus
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              Three pillars you can rename in code—or swap for stats, logos, or a
              single full-width feature block.
            </p>
            <ul className="mt-14 grid gap-8 sm:grid-cols-3">
              {pillars.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-stone-200/90 bg-canvas p-6 shadow-sm dark:border-stone-700 dark:bg-stone-950/50"
                >
                  <h3 className="font-display text-xl font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-20 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
              Contact
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Wire this block to a form service or replace with your email and phone.
            </p>
            <div className="mt-10 max-w-lg rounded-lg border border-stone-200/90 bg-surface p-8 shadow-sm dark:border-stone-700">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-ink">Email</dt>
                  <dd className="mt-1 text-muted">
                    <a
                      href="mailto:hello@example.com"
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      hello@example.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Phone</dt>
                  <dd className="mt-1 text-muted">+1 (000) 000-0000</dd>
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
