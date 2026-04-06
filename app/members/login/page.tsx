import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MembersLoginForm } from "@/components/MembersLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Member login | TTPSSWA",
  robots: { index: false, follow: false },
};

function LoginFormWithNext({ nextPath }: { nextPath: string | undefined }) {
  return <MembersLoginForm redirectAfterLogin={nextPath ?? null} variant="dark" />;
}

export default function MemberLoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.next;
  const nextPath = typeof raw === "string" ? raw : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-navy pt-[var(--site-header-stack)] text-white">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-center text-2xl font-bold">Member login</h1>
          <p className="mt-3 text-center text-sm text-slate-400">
            Use your username or email and password.{" "}
            <Link href="/login" className="font-semibold text-sky-300 underline underline-offset-2 hover:text-white">
              Membership application
            </Link>
          </p>
          <Suspense fallback={<p className="mt-8 text-center text-sm text-slate-500">Loading…</p>}>
            <LoginFormWithNext nextPath={nextPath} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
