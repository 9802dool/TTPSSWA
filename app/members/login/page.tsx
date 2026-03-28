import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemberLogoutButton } from "@/components/MemberLogoutButton";
import { MemberServiceRequestsSection } from "@/components/MemberServiceRequestsSection";
import { MembersLoginForm } from "@/components/MembersLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getServiceRequestsForEmail } from "@/lib/analytics-storage";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";
import { getPendingMemberSignupById } from "@/lib/member-signup-storage";
import { safeInternalNextPath } from "@/lib/safe-next-path";

export const metadata: Metadata = {
  title: "Members login | TTPSSWA",
  description:
    "Sign in after your membership application has been approved by an administrator.",
};

type Props = {
  searchParams: Promise<{ next?: string }> | { next?: string };
};

export default async function MembersLoginPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const nextPath = safeInternalNextPath(
    typeof sp.next === "string" ? sp.next : null,
  );

  const cookieStore = cookies();
  const token = cookieStore.get(getMemberCookieName())?.value;
  const memberId = token ? verifyMemberSession(token) : null;
  const member = memberId
    ? await getPendingMemberSignupById(memberId)
    : null;

  const sessionActive =
    member && member.applicationStatus === "accepted";

  if (sessionActive && nextPath) {
    redirect(nextPath);
  }

  const serviceRequests =
    sessionActive && member
      ? await getServiceRequestsForEmail(member.email)
      : [];

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
            {sessionActive ? (
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
                  Your application has been approved. Below are service requests
                  tied to your email (for example hotel reservations).
                </p>
                <div className="mt-8">
                  <MemberServiceRequestsSection
                    requests={serviceRequests}
                    variant="member"
                  />
                </div>
                <p className="mt-6 text-sm text-muted">
                  <Link
                    href="/membership-services#members-benefits"
                    className="font-medium text-brand hover:underline"
                  >
                    Members Benefits
                  </Link>{" "}
                  — full list on the membership services page.
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
            ) : memberId && member && member.applicationStatus !== "accepted" ? (
              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="font-medium text-amber-950 dark:text-amber-100">
                  Members area not available for this account
                </p>
                <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-100/90">
                  {member.applicationStatus === "pending"
                    ? "Your application is still under review. You will be able to sign in here after an administrator accepts it."
                    : "This application was not approved for online member access."}
                </p>
                <div className="mt-6">
                  <MemberLogoutButton />
                </div>
              </div>
            ) : memberId && !member ? (
              <div className="mt-8 rounded-xl border border-line bg-canvas p-6 dark:bg-surface">
                <p className="text-sm text-muted">
                  Your session is no longer valid. Please sign in again.
                </p>
                <div className="mt-4">
                  <MemberLogoutButton />
                </div>
              </div>
            ) : (
              <>
                <p className="mt-4 text-muted">
                  Only applicants whose membership has been{" "}
                  <strong className="text-ink">accepted by an administrator</strong>{" "}
                  can sign in. Use your{" "}
                  <strong className="text-ink">username or email</strong> and{" "}
                  <strong className="text-ink">password</strong> from your
                  application.{" "}
                  <Link
                    href="/login"
                    className="font-medium text-brand hover:text-brand-hover"
                  >
                    Submit an application
                  </Link>
                  .
                </p>
                <MembersLoginForm redirectAfterLogin={nextPath} />
                <p className="mt-8 text-center text-sm text-muted">
                  <Link
                    href="/membership-services#members-benefits"
                    className="text-brand hover:underline"
                  >
                    Members Benefits
                  </Link>{" "}
                  on the{" "}
                  <Link href="/membership-services" className="text-brand hover:underline">
                    membership services
                  </Link>{" "}
                  page.
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
