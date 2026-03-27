import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";
import { getPendingMemberSignupById } from "@/lib/member-signup-storage";
import { safeInternalNextPath } from "@/lib/safe-next-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CentralCommitteeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const token = cookieStore.get(getMemberCookieName())?.value;
  const memberId = token ? verifyMemberSession(token) : null;
  const member = memberId ? await getPendingMemberSignupById(memberId) : null;
  const ok = Boolean(member && member.applicationStatus === "accepted");

  if (!ok) {
    const h = headers();
    const rawReturn = h.get("x-cc-return");
    const next =
      safeInternalNextPath(rawReturn) ?? "/central-committee-representatives";
    redirect(`/members/login?next=${encodeURIComponent(next)}`);
  }

  return <>{children}</>;
}
