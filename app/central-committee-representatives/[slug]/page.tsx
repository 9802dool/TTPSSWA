import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  CENTRAL_COMMITTEE_REGIONS,
  getRegionBySlug,
} from "@/lib/central-committee-regions";
import { CommitteeRepPhotoFrame } from "@/components/CommitteeRepPhotoFrame";
import { COMMITTEE_REPRESENTATIVES } from "@/lib/central-committee-representatives-data";

/** Build a usable tel: URL for TT numbers; supports optional ext. (e.g. ext. 75412). */
function telHref(raw: string): string {
  const ext = raw.match(/ext\.?\s*(\d+)/i);
  const digits = raw.replace(/\D/g, "");
  const base = digits.slice(0, 10);
  if (base.length === 10 && base.startsWith("868")) {
    const e164 = `+1${base}`;
    return ext ? `tel:${e164};ext=${ext[1]}` : `tel:${e164}`;
  }
  return `tel:${raw.replace(/\s/g, "")}`;
}

/** Next 15 passes `params` as a Promise; Next 14 uses a plain object. */
type Props = { params: Promise<{ slug: string }> | { slug: string } };

export function generateStaticParams() {
  return CENTRAL_COMMITTEE_REGIONS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const region = getRegionBySlug(slug);
  if (!region) {
    return { title: "Region | TTPSSWA" };
  }
  const custom = COMMITTEE_REPRESENTATIVES[region.slug];
  const desc =
    custom?.intro?.slice(0, 155) ??
    `Central Committee Representative — ${region.name}.`;
  return {
    title: `${region.name} | Central Committee Representative | TTPSSWA`,
    description: desc,
  };
}

export default async function CentralCommitteeRegionPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const region = getRegionBySlug(slug);
  if (!region) {
    notFound();
  }

  const content = COMMITTEE_REPRESENTATIVES[region.slug];

  return (
    <>
      <SiteHeader />
      <main className="pt-[4.25rem]">
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-4">
              <Link
                href="/central-committee-representatives"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← All divisions
              </Link>
            </p>
            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Committee
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {region.name}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              {content?.intro ??
                "Central Committee Representative — add names, roles, and contact details for this division below."}
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-ink md:text-xl">
              Representatives
            </h2>
            {content?.representatives?.length ? (
              <ul className="mt-8 space-y-6">
                {content.representatives.map((rep) => (
                  <li
                    key={rep.name}
                    className="flex flex-col gap-5 rounded-xl border border-line bg-canvas p-5 text-sm shadow-corp dark:bg-surface sm:flex-row sm:items-start sm:gap-6"
                  >
                    <CommitteeRepPhotoFrame
                      name={rep.name}
                      photoSrc={rep.photoSrc}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-ink">{rep.name}</p>
                      {rep.role ? (
                        <p className="mt-1 font-medium text-brand">{rep.role}</p>
                      ) : null}
                      <p
                        className={`leading-relaxed text-muted ${rep.role ? "mt-3" : "mt-1"}`}
                      >
                        {rep.summary}
                      </p>
                      {rep.phone || rep.email ? (
                        <div className="mt-4 space-y-1 border-t border-line pt-4 text-muted">
                          {rep.phone ? (
                            <p>
                              <span className="font-semibold text-ink">Phone:</span>{" "}
                              <a
                                href={telHref(rep.phone)}
                                className="text-brand underline-offset-4 hover:underline"
                              >
                                {rep.phone}
                              </a>
                            </p>
                          ) : null}
                          {rep.email ? (
                            <p>
                              <span className="font-semibold text-ink">Email:</span>{" "}
                              <a
                                href={`mailto:${rep.email}`}
                                className="text-brand underline-offset-4 hover:underline"
                              >
                                {rep.email}
                              </a>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Replace this placeholder with your roster for{" "}
                  <span className="font-medium text-ink">{region.name}</span>.
                  Edit data in{" "}
                  <code className="rounded bg-line/80 px-1.5 py-0.5 text-xs">
                    lib/central-committee-representatives-data.ts
                  </code>
                  .
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="rounded-xl border border-line bg-canvas p-5 text-sm text-muted shadow-corp dark:bg-surface">
                    Representative name — role — contact (placeholder)
                  </li>
                </ul>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
