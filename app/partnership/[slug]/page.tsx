import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DreamBuilderPartnerGallery } from "@/components/DreamBuilderPartnerGallery";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  PARTNERSHIP_PROGRAMS,
  getPartnershipProgram,
} from "@/lib/partnership-programs-data";

/** Next 15 passes `params` as a Promise; Next 14 uses a plain object. */
type Props = { params: Promise<{ slug: string }> | { slug: string } };

export function generateStaticParams() {
  return PARTNERSHIP_PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const program = getPartnershipProgram(slug);
  if (!program) {
    return { title: "Partnership | TTPSSWA" };
  }
  const desc =
    program.slug === "dream-builder-colour-studio-ltd"
      ? "Member discounts of 5–20% on Dream Builder Colour Studio Ltd — colour consultations, materials, and finishes in Arima."
      : `${program.title} — TTPSSWA partnership program.`;
  return {
    title: `${program.title} | Partnership | TTPSSWA`,
    description: desc,
  };
}

export default async function PartnershipProgramPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const program = getPartnershipProgram(slug);
  if (!program) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Trinidad and Tobago Police Service Social Welfare Association
            </p>
            <p className="mt-4 text-center">
              <Link
                href="/partnership"
                className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                ← Back to partnership
              </Link>
            </p>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {program.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
              TTPSSWA partnership program.{" "}
              <Link href="/" className="font-semibold text-brand hover:underline">
                Home
              </Link>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <section
            aria-labelledby="partnership-program-body"
            className="border-2 border-slate-300 bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 dark:border-slate-600 dark:bg-white"
          >
            <h2 id="partnership-program-body" className="sr-only">
              Program details
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              <p>{program.body}</p>
              {program.bodySecondary ? <p>{program.bodySecondary}</p> : null}
              {program.contact ? (
                <div className="border-t border-line pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink">
                    {program.contact.status}
                  </p>
                  <h3 className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-ink">
                    Location
                  </h3>
                  <p className="mt-1">{program.contact.address}</p>
                  <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink">
                    Contact info
                  </h3>
                  <p className="mt-1">
                    <a
                      href={`tel:${program.contact.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
                    >
                      {program.contact.phone}
                    </a>
                  </p>
                  <p className="mt-1">
                    <a
                      href={`mailto:${program.contact.email}`}
                      className="font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
                    >
                      {program.contact.email}
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
            {program.hasGallery ? (
              <div className="mt-6">
                <DreamBuilderPartnerGallery />
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
