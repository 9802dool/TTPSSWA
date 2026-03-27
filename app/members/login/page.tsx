import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MemberLogoutButton } from "@/components/MemberLogoutButton";
import { MembersLoginForm } from "@/components/MembersLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";
import { getPendingMemberSignupById } from "@/lib/member-signup-storage";

export const metadata: Metadata = {
  title: "Members login | TTPSSWA",
  description:
    "Sign in with your username or email and password after submitting a membership application.",
};

export default async function MembersLoginPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(getMemberCookieName())?.value;
  const memberId = token ? verifyMemberSession(token) : null;
  const member = memberId
    ? await getPendingMemberSignupById(memberId)
    : null;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4.25rem)] bg-canvas pt-[4.25rem]">
        <section className="border-b border-line bg-surface py-12 dark:bg-canvas">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Members
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Members login
            </h1>
            {member ? (
              <div className="mt-8 rounded-xl border border-line bg-canvas p-6 shadow-corp dark:bg-surface">
                <p className="text-sm text-muted">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {member.fullName}
                </p>
                {member.username ? (
                  <p className="mt-1 font-mono text-sm text-muted">
                    @{member.username}
                  </p>
                ) : null}
                <p className="mt-4 text-sm text-muted">
                  Your application is pending review. Member services will expand
                  here as they become available.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <MemberLogoutButton />
                  <Link
                    href="/"
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Back to home
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Signup / Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-4 text-muted">
                  Use the <strong className="text-ink">username or email</strong>{" "}
                  and <strong className="text-ink">password</strong> from your
                  membership application. Need an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-brand hover:text-brand-hover"
                  >
                    Apply here
                  </Link>
                  .
                </p>
                <MembersLoginForm />
                <p className="mt-8 text-center text-sm text-muted">
                  <Link href="/#contact" className="text-brand hover:underline">
                    Contact
                  </Link>{" "}
                  for membership assistance.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
