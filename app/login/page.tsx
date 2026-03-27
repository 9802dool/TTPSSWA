import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Signup / Login | TTPSSWA",
  description:
    "Sign up or log in to TTPSSWA member services.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4.25rem)] bg-canvas pt-[4.25rem]">
        <section className="border-b border-line bg-surface py-16 dark:bg-canvas">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Account
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Signup / Login
            </h1>
            <p className="mt-4 text-muted">
              Choose an option below. Member sign-up is handled through our contact
              channels; members can use the member login when available.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col rounded-xl border border-line bg-canvas p-8 shadow-corp dark:bg-surface">
                <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                <h2 className="text-lg font-bold text-ink">Sign up</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  Get in touch to register or learn about membership.
                </p>
                <Link
                  href="/#contact"
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover"
                >
                  Contact us
                </Link>
              </div>
              <div className="flex flex-col rounded-xl border border-line bg-canvas p-8 shadow-corp dark:bg-surface">
                <div className="mb-4 h-1 w-10 rounded-full bg-brand" />
                <h2 className="text-lg font-bold text-ink">Members login</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  Access member resources and updates when sign-in is enabled.
                </p>
                <Link
                  href="/members/login"
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md border border-line bg-surface px-6 text-sm font-semibold text-ink shadow-corp transition hover:border-brand/40 hover:bg-brand-subtle dark:bg-canvas"
                >
                  Members login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
