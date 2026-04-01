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

function whatsappMeHref(displayNumber: string): string {
  const digits = displayNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

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

  const isDreamBuilder = program.slug === "dream-builder-colour-studio-ltd";

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div
          className={
            isDreamBuilder
              ? "border-b border-slate-300/80 bg-transparent py-10 dark:border-slate-600/80"
              : "border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950"
          }
        >
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
            className={
              isDreamBuilder
                ? "border-0 bg-transparent px-0 py-2 shadow-none sm:px-0 sm:py-4"
                : "border-2 border-slate-300 bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 dark:border-slate-600 dark:bg-white"
            }
          >
            <h2 id="partnership-program-body" className="sr-only">
              Program details
            </h2>
            <div
              className={
                isDreamBuilder
                  ? "space-y-5 text-base font-medium leading-relaxed text-ink sm:space-y-6 sm:text-lg sm:leading-relaxed"
                  : "space-y-4 text-sm leading-relaxed text-muted"
              }
            >
              <p className={isDreamBuilder ? "text-pretty" : undefined}>
                {program.body}
              </p>
              {program.bodySecondary ? (
                <p className={isDreamBuilder ? "text-pretty" : undefined}>
                  {program.bodySecondary}
                </p>
              ) : null}
              {program.contact ? (
                <div
                  className={
                    isDreamBuilder
                      ? "border-t-2 border-slate-200 pt-6 dark:border-slate-300"
                      : "border-t border-line pt-4"
                  }
                >
                  <p
                    className={
                      isDreamBuilder
                        ? "inline-flex rounded-full border border-emerald-600/50 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-900 sm:text-base"
                        : "text-xs font-bold uppercase tracking-[0.14em] text-ink"
                    }
                  >
                    {program.contact.status}
                  </p>
                  <h3
                    className={
                      isDreamBuilder
                        ? "mt-5 text-sm font-bold uppercase tracking-[0.12em] text-ink sm:mt-6 sm:text-base"
                        : "mt-3 text-xs font-bold uppercase tracking-[0.14em] text-ink"
                    }
                  >
                    Location
                  </h3>
                  <p
                    className={
                      isDreamBuilder
                        ? "mt-2 text-lg font-semibold leading-snug text-ink sm:text-xl"
                        : "mt-1"
                    }
                  >
                    {program.contact.address}
                  </p>
                  <h3
                    className={
                      isDreamBuilder
                        ? "mt-6 text-sm font-bold uppercase tracking-[0.12em] text-ink sm:text-base"
                        : "mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink"
                    }
                  >
                    Contact info
                  </h3>
                  <p className={isDreamBuilder ? "mt-2" : "mt-1"}>
                    <a
                      href={`tel:${program.contact.phone.replace(/\s/g, "")}`}
                      className={
                        isDreamBuilder
                          ? "text-lg font-bold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover sm:text-xl"
                          : "font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
                      }
                    >
                      {program.contact.phone}
                    </a>
                  </p>
                  {program.contact.whatsapp ? (
                    <>
                      <h3
                        className={
                          isDreamBuilder
                            ? "mt-6 text-sm font-bold uppercase tracking-[0.12em] text-ink sm:text-base"
                            : "mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink"
                        }
                      >
                        WhatsApp
                      </h3>
                      <p className={isDreamBuilder ? "mt-2" : "mt-1"}>
                        <a
                          href={whatsappMeHref(program.contact.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={
                            isDreamBuilder
                              ? "text-lg font-bold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover sm:text-xl"
                              : "font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
                          }
                        >
                          {program.contact.whatsapp}
                        </a>
                      </p>
                    </>
                  ) : null}
                  <p className={isDreamBuilder ? "mt-2" : "mt-1"}>
                    <a
                      href={`mailto:${program.contact.email}`}
                      className={
                        isDreamBuilder
                          ? "text-lg font-bold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover sm:text-xl break-all"
                          : "font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover"
                      }
                    >
                      {program.contact.email}
                    </a>
                  </p>
                  {program.contact.facebookUrl ? (
                    <>
                      <h3
                        className={
                          isDreamBuilder
                            ? "mt-6 text-sm font-bold uppercase tracking-[0.12em] text-ink sm:text-base"
                            : "mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink"
                        }
                      >
                        Facebook
                      </h3>
                      <p className={isDreamBuilder ? "mt-2" : "mt-1"}>
                        <a
                          href={program.contact.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={
                            isDreamBuilder
                              ? "text-lg font-bold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover sm:text-xl break-all"
                              : "font-semibold text-brand underline decoration-slate-400 underline-offset-2 hover:text-brand-hover break-all"
                          }
                        >
                          {program.contact.facebookUrl.replace(/^https?:\/\/(www\.)?/i, "")}
                        </a>
                      </p>
                    </>
                  ) : null}
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
