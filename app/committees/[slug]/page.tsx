import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { COMMITTEES, getCommitteeBySlug } from "@/lib/committees-data";

/** Build a usable tel: URL for TT numbers. */
function telHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const base = digits.slice(0, 10);
  if (base.length === 10 && base.startsWith("868")) {
    return `tel:+1${base}`;
  }
  return `tel:${raw.replace(/\s/g, "")}`;
}

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
          <div className="relative site-container py-12 sm:py-16">
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

        <section className="border-b border-line bg-white py-12 dark:bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {committee.channels && committee.channels.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-committee-ink">
                  {committee.channelsHeading ?? "Key initiatives and programmes"}
                </h2>
                <ul className="mt-6 list-none space-y-6 p-0">
                  {committee.channels.map((item, i) => (
                    <li key={i} className="text-base font-bold leading-relaxed text-committee-ink">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-base font-bold leading-relaxed text-committee-ink">
                Further details for <span className="font-extrabold text-committee-ink">{committee.title}</span> will appear
                in this section as they become available.
              </p>
            )}
          </div>
        </section>

        {committee.members && committee.members.length > 0 ? (
          <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-lg font-bold text-ink md:text-xl">Committee members</h2>
              <ul className="mt-8 space-y-6">
                {committee.members.map((member) => (
                  <li
                    key={member.name}
                    className="rounded-xl border border-line bg-canvas p-5 text-sm shadow-corp dark:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-bold text-ink">{member.name}</p>
                      {member.role ? (
                        <p className="mt-1 font-medium text-brand">{member.role}</p>
                      ) : null}
                      {member.summary ? (
                        <p
                          className={`leading-relaxed text-muted ${member.role ? "mt-3" : "mt-1"}`}
                        >
                          {member.summary}
                        </p>
                      ) : null}
                      {member.phone || member.email ? (
                        <div className="mt-4 space-y-1 border-t border-line pt-4 text-muted">
                          {member.phone ? (
                            <p>
                              <span className="font-semibold text-ink">Phone:</span>{" "}
                              <a
                                href={telHref(member.phone)}
                                className="text-brand underline-offset-4 hover:underline"
                              >
                                {member.phone}
                              </a>
                            </p>
                          ) : null}
                          {member.email ? (
                            <p>
                              <span className="font-semibold text-ink">Email:</span>{" "}
                              <a
                                href={`mailto:${member.email}`}
                                className="text-brand underline-offset-4 hover:underline"
                              >
                                {member.email}
                              </a>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
