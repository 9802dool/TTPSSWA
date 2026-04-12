import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberBenefitDetailsText } from "@/components/MemberBenefitDetailsText";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  MEMBER_BENEFITS,
  getMemberBenefitByBenefitId,
} from "@/lib/member-benefits-data";

type Props = {
  params: Promise<{ benefitId: string }> | { benefitId: string };
};

export function generateStaticParams() {
  return MEMBER_BENEFITS.map((b) => ({ benefitId: String(b.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { benefitId } = await Promise.resolve(params);
  const benefit = getMemberBenefitByBenefitId(benefitId);
  if (!benefit) {
    return { title: "Benefit | TTPSSWA" };
  }
  return {
    title: `${benefit.title} | Membership services | TTPSSWA`,
    description: `Member benefit: ${benefit.title}.`,
  };
}

export default async function MembershipBenefitPage({ params }: Props) {
  const { benefitId } = await Promise.resolve(params);
  const benefit = getMemberBenefitByBenefitId(benefitId);
  if (!benefit) {
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
                href="/membership-services"
                className="inline-flex text-sm font-medium text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                ← Membership services
              </Link>
            </p>
            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Member benefit
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{benefit.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Eligibility, how to apply, and links for this program.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <MemberBenefitDetailsText number={benefit.number} title={benefit.title} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
