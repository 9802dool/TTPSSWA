import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/** Public folder: `public/ex-pics/` (no spaces — Next/Image breaks on %20 paths). */
const EX_PICS = "/ex-pics";

export const metadata: Metadata = {
  title: "OUR EXECUTIVE TEAM | TTPSSWA",
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

/** p1–p5 → President through Treasurer (same order as `roles`). */
const EXEC_PHOTOS = [
  `${EX_PICS}/p1.JPG`,
  `${EX_PICS}/p2.JPG`,
  `${EX_PICS}/p3.JPG`,
  `${EX_PICS}/p4.JPG`,
  `${EX_PICS}/p5.JPG`,
] as const;

export default function ExecutivePage() {
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
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Leadership
            </p>
            <h1 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">
              OUR EXECUTIVE TEAM
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Names and photos can be added below. Each role has a dedicated seat on
              the committee.
            </p>
          </div>
        </section>

        <section className="bg-canvas py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role, index) => (
                <li
                  key={`${role.title}-${index}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-corp transition hover:shadow-corp-md dark:bg-surface"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                    <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-navy text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {index < EXEC_PHOTOS.length ? (
                      <Image
                        src={EXEC_PHOTOS[index]}
                        alt={`${role.title} portrait`}
                        fill
                        priority={index < 2}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Photo
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {role.subtitle}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-ink">{role.title}</h2>
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
