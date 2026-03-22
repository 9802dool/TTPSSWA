import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Meet our executive | TTPSSWA",
  description: "TTPSSWA executive committee — leadership and representatives.",
};

const roles = [
  { title: "President", subtitle: "Executive lead" },
  { title: "Vice President", subtitle: "Deputy executive lead" },
  { title: "Secretary", subtitle: "Records & correspondence" },
  { title: "Assistant Secretary", subtitle: "Supports the Secretary" },
  { title: "Treasurer", subtitle: "Finance & accounts" },
  {
    title: "Special Reserve Police Representative",
    subtitle: "SRP liaison",
  },
  {
    title: "Municipal Police Representative",
    subtitle: "Municipal police liaison",
  },
  {
    title: "First Division Officer Representative",
    subtitle: "First Division liaison",
  },
  { title: "Trustee", subtitle: "Board of trustees — seat 1" },
  { title: "Trustee", subtitle: "Board of trustees — seat 2" },
] as const;

export default function ExecutivePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="border-b border-stone-200/80 dark:border-stone-800">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Leadership
            </p>
            <h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
              Meet our executive
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Names and photos can be added below. Each role has a dedicated spot
              on the committee.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role, index) => (
                <li
                  key={`${role.title}-${index}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-stone-200/90 bg-surface shadow-sm dark:border-stone-700 dark:bg-stone-950/50"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-stone-200/90 to-stone-300/60 dark:from-stone-800 dark:to-stone-900">
                    <div className="flex h-full w-full items-center justify-center p-6 text-center">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        Photo
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {role.subtitle}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-medium text-ink">
                      {role.title}
                    </h2>
                    <p className="mt-4 text-sm text-muted">Name to be announced</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
