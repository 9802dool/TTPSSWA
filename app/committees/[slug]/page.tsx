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
        <section className="bg-canvas py-12 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6">
              <Link
                href="/committees"
                className="inline-flex text-sm font-bold text-navy underline-offset-4 transition hover:text-brand hover:underline dark:text-sky-200 dark:hover:text-white"
              >
                ← All committees
              </Link>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-sky-100 md:text-4xl">
              {committee.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed text-navy dark:text-sky-100">
              {committee.summary ??
                "Information, contacts, and updates for this committee can be added here."}
            </p>

            {committee.channels && committee.channels.length > 0 ? (
              <>
                <h2 className="mt-12 text-2xl font-bold tracking-tight text-navy dark:text-sky-100">
                  {committee.channelsHeading ?? "Key initiatives and programmes"}
                </h2>
                <ul className="mt-6 list-none space-y-6 p-0">
                  {committee.channels.map((item, i) => (
                    <li key={i} className="text-base font-bold leading-relaxed text-navy dark:text-sky-100">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-10 text-base font-bold leading-relaxed text-navy dark:text-sky-100">
                Further details for <span className="text-brand dark:text-sky-300">{committee.title}</span> will appear
                in this section as they become available.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
