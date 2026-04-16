import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  COMMITTEES,
  getCommitteeBySlug,
  getCommitteeDetailContent,
} from "@/lib/committees-data";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

export function generateStaticParams() {
  return COMMITTEES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const committee = getCommitteeBySlug(slug);
  if (!committee) {
    return { title: "Committee | TTPSSWA" };
  }
  const detail = getCommitteeDetailContent(slug);
  return {
    title: `${committee.title} | Committees | TTPSSWA`,
    description:
      detail?.metaDescription ??
      `TTPSSWA ${committee.title} — information and contacts.`,
  };
}

export default async function CommitteeDetailPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const committee = getCommitteeBySlug(slug);
  if (!committee) {
    notFound();
  }

  const detail = getCommitteeDetailContent(slug);

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
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-4">
              <Link
                href="/committees"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← All committees
              </Link>
            </p>
            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Committee
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{committee.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              {detail?.heroDescription ??
                "Information, contacts, and updates for this committee can be added here."}
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {detail?.richSections && detail.richSections.length > 0 ? (
              <div className="space-y-10">
                {detail.overviewIntro ? (
                  <p className="text-base leading-relaxed text-muted">{detail.overviewIntro}</p>
                ) : null}
                {detail.richSections.map((block, i) => (
                  <div key={i} className="space-y-4">
                    {block.title ? (
                      <h2 className="text-xl font-semibold tracking-tight text-ink">{block.title}</h2>
                    ) : null}
                    {block.paragraphs.map((p, j) => (
                      <p key={`${i}-${j}`} className="text-base leading-relaxed text-muted">
                        {p}
                      </p>
                    ))}
                    {block.bullets && block.bullets.length > 0 ? (
                      <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted marker:text-navy">
                        {block.bullets.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    {block.afterBullets ? (
                      <p className="text-base leading-relaxed text-muted">{block.afterBullets}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : detail?.highlights && detail.highlights.length > 0 ? (
              <div className="space-y-6">
                {detail.sectionHeading ? (
                  <h2 className="text-xl font-semibold tracking-tight text-ink">{detail.sectionHeading}</h2>
                ) : null}
                <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed text-muted marker:text-navy">
                  {detail.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Further details for <span className="font-medium text-ink">{committee.title}</span> will appear in this
                section as they become available.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
