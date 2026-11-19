import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Coming soon | TTPSSWA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const OFFICE = {
  address: ["4th Floor, Riverside Plaza", "#3 Besson Street", "Port of Spain"],
  phones: [
    { display: "235-5260", href: "tel:+18682355260" },
    { display: "792-6226", href: "tel:+18687926226" },
  ],
  whatsapp: "https://wa.me/18687926226",
};

const COPY: Record<string, { title: string; body: string; showWhatsapp: boolean }> = {
  hotel: {
    title: "Hotel reservations are coming soon",
    body: "Online booking for the Noel Chase Hotel and Conference Centre is not available yet. Call the office, or message us on WhatsApp for hotel enquiries.",
    showWhatsapp: true,
  },
  "membership-services": {
    title: "Membership services are coming soon",
    body: "Benefit details and application forms are not available on the site yet. Call the office and we will help you with your request.",
    showWhatsapp: false,
  },
  "membership-signup": {
    title: "Member signup is coming soon",
    body: "Online signup and member login are not available yet. Call the office if you would like to join the association.",
    showWhatsapp: false,
  },
  admin: {
    title: "This area is not available",
    body: "The admin area is switched off for launch. If you need something from the association, contact the office.",
    showWhatsapp: false,
  },
};

const DEFAULT_COPY = {
  title: "Coming soon",
  body: "This page is not available yet. Contact the office and we will help you.",
  showWhatsapp: false,
};

type Search = { section?: string | string[] };

export default function ComingSoonPage({ searchParams }: { searchParams?: Search }) {
  const raw = searchParams?.section;
  const section = Array.isArray(raw) ? raw[0] : raw;
  const copy = (section && COPY[section]) || DEFAULT_COPY;

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
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative site-container py-14 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">TTPSSWA</p>
            <h1 className="mt-3 max-w-3xl text-fluid-3xl font-bold tracking-tight md:text-fluid-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{copy.body}</p>
            <p className="mt-8">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy transition hover:opacity-90"
              >
                Back to home
              </Link>
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-[#e8ecf1] py-14 dark:border-slate-800 dark:bg-slate-900">
          <div className="site-container-reading">
            <h2 className="text-xl font-bold text-ink dark:text-white">Association office</h2>
            <address className="mt-4 space-y-1 text-base not-italic leading-relaxed text-muted dark:text-slate-400">
              {OFFICE.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pt-3">
                Tel:{" "}
                {OFFICE.phones.map((phone, index) => (
                  <span key={phone.href}>
                    {index > 0 ? " / " : null}
                    <a href={phone.href} className="font-semibold text-brand hover:underline">
                      {phone.display}
                    </a>
                  </span>
                ))}
              </p>
              {copy.showWhatsapp ? (
                <p className="pt-2">
                  WhatsApp (hotel enquiries):{" "}
                  <a
                    href={OFFICE.whatsapp}
                    className="font-semibold text-brand hover:underline"
                    rel="noopener noreferrer"
                  >
                    792-6226
                  </a>
                </p>
              ) : null}
            </address>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
