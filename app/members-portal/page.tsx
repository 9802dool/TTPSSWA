import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Members portal | TTPSSWA",
  description:
    "Access member login, benefits, and services for Trinidad and Tobago Police Service Social Welfare Association members.",
};

const portalLinks: { href: string; title: string; description: string }[] = [
  {
    href: "/members/login",
    title: "Members login",
    description:
      "Sign in with your username or email and password after your application has been accepted.",
  },
  {
    href: "/login",
    title: "Signup / application",
    description:
      "Apply for membership or create credentials to access the members area when approved.",
  },
  {
    href: "/membership-services#members-benefits",
    title: "Members Benefits",
    description: "Browse the full list of association benefits and programs.",
  },
  {
    href: "/membership-services",
    title: "Membership services",
    description: "Overview of services and resources for members.",
  },
  {
    href: "/central-committee-representatives",
    title: "Central Committee Representative",
    description:
      "Find representatives by region and view committee information.",
  },
];

export default function MembersPortalPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4.25rem)] bg-canvas pt-[4.25rem]">
        <section className="border-b border-line bg-gradient-to-b from-surface to-canvas py-12 dark:from-canvas dark:to-surface">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Members
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Members portal
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Use the links below to sign in, apply for membership, or view benefits
              and services.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <ul className="space-y-4">
            {portalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-line bg-surface p-5 shadow-corp transition hover:border-brand/40 hover:shadow-corp-md dark:bg-surface"
                >
                  <h2 className="text-base font-semibold text-brand">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-ink">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-sm text-muted">
            <Link href="/" className="font-medium text-brand hover:underline">
              Back to home
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
