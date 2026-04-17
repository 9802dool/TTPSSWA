import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { COMMITTEES, getCommitteeBySlug } from "@/lib/committees-data";

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
  return {
    title: `${committee.title} | Committees | TTPSSWA`,
    description:
      committee.summary ?? `TTPSSWA ${committee.title} — information and contacts.`,
  };
}

export default async function CommitteeDetailPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const committee = getCommitteeBySlug(slug);
  if (!committee) {
    notFound();
  }

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
            <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-slate-100">
              {committee.summary ??
                "Information, contacts, and updates for this committee can be added here."}
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {committee.channels && committee.channels.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {committee.channelsHeading ?? "Key initiatives and programmes"}
                </h2>
                <ul className="mt-6 divide-y divide-zinc-200 dark:divide-slate-600">
                  {committee.channels.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 py-5 text-base font-bold leading-relaxed text-zinc-950 first:pt-0 last:pb-0 dark:text-zinc-100"
                    >
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-2 w-2 flex-none shrink-0 rounded-full bg-brand"
                      />
                      <span className="text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-base font-bold leading-relaxed text-zinc-950 dark:text-zinc-100">
                Further details for <span className="text-black dark:text-white">{committee.title}</span> will appear in
                this section as they become available.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
