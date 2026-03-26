import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  CENTRAL_COMMITTEE_REGIONS,
  getRegionBySlug,
} from "@/lib/central-committee-regions";

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
  return {
    title: `${region.name} | Central Committee Representative | TTPSSWA`,
    description: `Central Committee Representative — ${region.name}.`,
  };
}

export default async function CentralCommitteeRegionPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const region = getRegionBySlug(slug);
  if (!region) {
    notFound();
  }

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
              Central Committee Representative — add names, roles, and contact
              details for this division below.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-ink md:text-xl">
              Representatives
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Replace this placeholder with your roster for{" "}
              <span className="font-medium text-ink">{region.name}</span>. Edit
              in{" "}
              <code className="rounded bg-line/80 px-1.5 py-0.5 text-xs">
                app/central-committee-representatives/[slug]/page.tsx
              </code>
              .
            </p>
            <ul className="mt-8 space-y-4">
              <li className="rounded-xl border border-line bg-canvas p-5 text-sm text-muted shadow-corp dark:bg-surface">
                Representative name — role — contact (placeholder)
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
