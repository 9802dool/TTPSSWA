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
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-slate-950 pt-[var(--site-header-stack)] text-slate-100">
        <section className="border-b border-slate-800/80 py-12 pb-16">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Members
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Members login
            </h1>
            {sessionActive ? (
              <div className="mt-8 rounded-xl border border-slate-700/80 bg-slate-900/60 p-6 shadow-corp backdrop-blur-sm">
                <p className="text-sm text-slate-400">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {member.fullName}
                </p>
                {member.username ? (
                  <p className="mt-1 font-mono text-sm text-slate-400">
                    @{member.username}
                  </p>
                ) : null}
                <p className="mt-4 text-sm text-slate-400">
                  Your application has been approved. Below are service requests
                  tied to your email (for example hotel reservations).
                </p>
                <div className="mt-8">
                  <MemberServiceRequestsSection
                    requests={serviceRequests}
                    variant="member"
                  />
                </div>
                <p className="mt-6 text-sm text-slate-400">
                  <Link
                    href="/membership-services#members-benefits"
                    className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Members Benefits
                  </Link>{" "}
                  — full list on the membership services page.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <MemberLogoutButton />
                  <Link
                    href="/"
                    className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Back to home
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Signup / Login
                  </Link>
                </div>
              </div>
            ) : memberId && member && member.applicationStatus !== "accepted" ? (
              <div className="mt-8 rounded-xl border border-amber-700/50 bg-amber-950/40 p-6">
                <p className="font-medium text-amber-100">
                  Members area not available for this account
                </p>
                <p className="mt-2 text-sm text-amber-100/85">
                  {member.applicationStatus === "pending"
                    ? "Your application is still under review. You will be able to sign in here after an administrator accepts it."
                    : "This application was not approved for online member access."}
                </p>
                <div className="mt-6">
                  <MemberLogoutButton />
                </div>
              </div>
            ) : memberId && !member ? (
              <div className="mt-8 rounded-xl border border-slate-700/80 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">
                  Your session is no longer valid. Please sign in again.
                </p>
                <div className="mt-4">
                  <MemberLogoutButton />
                </div>
              </div>
            ) : (
              <>
                <p className="mt-6 text-[15px] leading-relaxed text-slate-400">
                  Only applicants whose membership has been{" "}
                  <strong className="font-semibold text-white">
                    accepted by an administrator
                  </strong>{" "}
                  can sign in. Use your{" "}
                  <strong className="font-semibold text-white">
                    username or email
                  </strong>{" "}
                  and{" "}
                  <strong className="font-semibold text-white">password</strong>{" "}
                  from your application.{" "}
                  <Link
                    href="/login"
                    className="font-medium text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
                  >
                    Submit an application
                  </Link>
                  .
                </p>
                <MembersLoginForm
                  redirectAfterLogin={nextPath}
                  variant="dark"
                />
                <p className="mt-10 text-center text-sm text-slate-400">
                  <Link
                    href="/membership-services#members-benefits"
                    className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Members Benefits
                  </Link>{" "}
                  on the{" "}
                  <Link
                    href="/membership-services"
                    className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
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
