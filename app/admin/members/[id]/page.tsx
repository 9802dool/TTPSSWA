import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminMemberApplicationActions } from "@/components/AdminMemberApplicationActions";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { MemberServiceRequestsSection } from "@/components/MemberServiceRequestsSection";
import SiteHeader from "@/components/SiteHeader";
import { getServiceRequestsForEmail } from "@/lib/analytics-storage";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
import {
  formatMemberPhoneDisplay,
  memberPhoneTelHref,
} from "@/lib/member-phone";
import { getPendingMemberSignupById } from "@/lib/member-signup-storage";

type Props = { params: Promise<{ id: string }> | { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const member = await getPendingMemberSignupById(decodeURIComponent(id));
  if (!member) {
    return { title: "Member profile | Admin | TTPSSWA" };
  }
  return {
    title: `${member.fullName} | Member profile | TTPSSWA`,
    description: `Pending member signup — ${member.regimentalNumber}`,
  };
}

export default async function AdminMemberProfilePage({ params }: Props) {
  const { id } = await Promise.resolve(params);
  const decodedId = decodeURIComponent(id);

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/admin/members/${decodedId}`)}`,
    );
  }

  const member = await getPendingMemberSignupById(decodedId);
  if (!member) {
    notFound();
  }

  const serviceRequests = await getServiceRequestsForEmail(member.email);

  const photoSrc = `data:${member.photoMimeType};base64,${member.photoBase64}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
              <Link
                href="/admin"
                className="text-[var(--brand)] hover:underline"
              >
                ← Site administration
              </Link>
              {member.applicationStatus === "pending" ? (
                <Link
                  href="/admin/new-membership"
                  className="text-[var(--brand)] hover:underline"
                >
                  ← New Membership Applications
                </Link>
              ) : null}
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Member profile
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Submitted {member.createdAt} (UTC)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl border-b border-[var(--border)] bg-[var(--bg)] px-4 py-4">
        <form
          method="get"
          action="/admin"
          className="flex flex-wrap items-end gap-2"
          role="search"
        >
          <div className="min-w-[min(100%,18rem)] flex-1">
            <label
              htmlFor="profile-member-search"
              className="block text-xs font-medium text-[var(--muted)]"
            >
              Search members by name
            </label>
            <input
              id="profile-member-search"
              name="q"
              type="search"
              placeholder="Name, username, or regimental number"
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] outline-none ring-[var(--brand)] placeholder:text-[var(--muted)] focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="site-btn-admin-muted"
          >
            Search
          </button>
        </form>
      </div>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Status
            </p>
            <p
              className={`mt-1 font-medium capitalize ${
                member.applicationStatus === "accepted"
                  ? "text-green-700 dark:text-green-400"
                  : member.applicationStatus === "rejected"
                    ? "text-red-700 dark:text-red-400"
                    : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {member.applicationStatus}
            </p>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Admin actions
              </p>
              <div className="mt-2">
                <AdminMemberApplicationActions
                  memberId={member.id}
                  applicationStatus={member.applicationStatus}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-8 p-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
            <div className="mx-auto w-full max-w-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt={`Photo of ${member.fullName}`}
                className="aspect-square w-full rounded-lg border border-[var(--border)] object-cover"
              />
              <p className="mt-2 text-center text-xs text-[var(--muted)]">
                Facial photo on file
              </p>
            </div>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Username</dt>
                <dd className="mt-0.5 font-mono font-medium">
                  {member.username ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Password</dt>
                <dd className="mt-0.5 text-[var(--muted)]">
                  {member.passwordHash
                    ? "Stored securely (one-way hash — not shown)"
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Regimental number</dt>
                <dd className="mt-0.5 font-mono font-medium">{member.regimentalNumber}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Rank</dt>
                <dd className="mt-0.5 font-medium">{member.rank}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="mt-0.5 text-base font-semibold">{member.fullName}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Address</dt>
                <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed">
                  {member.address}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${encodeURIComponent(member.email)}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {member.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Phone</dt>
                <dd className="mt-0.5">
                  <a
                    href={memberPhoneTelHref(member)}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {formatMemberPhoneDisplay(member)}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Financial member</dt>
                <dd className="mt-0.5 capitalize">{member.financialMember}</dd>
              </div>
              {member.departmentDivision ? (
                <div>
                  <dt className="text-[var(--muted)]">Department / division</dt>
                  <dd className="mt-0.5">{member.departmentDivision}</dd>
                </div>
              ) : null}
              {member.sectionStation ? (
                <div>
                  <dt className="text-[var(--muted)]">Section / station</dt>
                  <dd className="mt-0.5">{member.sectionStation}</dd>
                </div>
              ) : null}
              {member.age ? (
                <div>
                  <dt className="text-[var(--muted)]">Age</dt>
                  <dd className="mt-0.5">{member.age}</dd>
                </div>
              ) : null}
              {member.sex ? (
                <div>
                  <dt className="text-[var(--muted)]">Sex</dt>
                  <dd className="mt-0.5 capitalize">{member.sex}</dd>
                </div>
              ) : null}
              {member.dateOfBirth ? (
                <div>
                  <dt className="text-[var(--muted)]">Date of birth</dt>
                  <dd className="mt-0.5">{member.dateOfBirth}</dd>
                </div>
              ) : null}
              {member.dateOfEnlistment ? (
                <div>
                  <dt className="text-[var(--muted)]">Date of enlistment</dt>
                  <dd className="mt-0.5">{member.dateOfEnlistment}</dd>
                </div>
              ) : null}
              {member.phoneHome ? (
                <div>
                  <dt className="text-[var(--muted)]">Phone (home)</dt>
                  <dd className="mt-0.5 font-mono">{member.phoneHome}</dd>
                </div>
              ) : null}
              {member.phoneWork ? (
                <div>
                  <dt className="text-[var(--muted)]">Phone (work)</dt>
                  <dd className="mt-0.5 font-mono">{member.phoneWork}</dd>
                </div>
              ) : null}
              {member.applicationDateSigned ? (
                <div>
                  <dt className="text-[var(--muted)]">Application date (signed)</dt>
                  <dd className="mt-0.5">{member.applicationDateSigned}</dd>
                </div>
              ) : null}
              {member.declarationAccepted ? (
                <div>
                  <dt className="text-[var(--muted)]">Declaration</dt>
                  <dd className="mt-0.5 text-green-700 dark:text-green-400">
                    Membership &amp; $140 deduction acknowledged
                  </dd>
                </div>
              ) : null}
              {member.beneficiaryFullName ? (
                <div className="border-t border-[var(--border)] pt-4">
                  <dt className="text-[var(--muted)]">Beneficiary</dt>
                  <dd className="mt-1 space-y-1 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">Name: </span>
                      {member.beneficiaryFullName}
                    </div>
                    {member.beneficiaryRegimentalNumber ? (
                      <div>
                        <span className="text-[var(--muted)]">Reg. no.: </span>
                        {member.beneficiaryRegimentalNumber}
                      </div>
                    ) : null}
                    {member.beneficiaryRank ? (
                      <div>
                        <span className="text-[var(--muted)]">Rank: </span>
                        {member.beneficiaryRank}
                      </div>
                    ) : null}
                    {member.beneficiaryRelationship ? (
                      <div>
                        <span className="text-[var(--muted)]">Relationship: </span>
                        {member.beneficiaryRelationship}
                      </div>
                    ) : null}
                    {member.beneficiaryIdNumber ? (
                      <div>
                        <span className="text-[var(--muted)]">ID / DP / PP: </span>
                        {member.beneficiaryIdNumber}
                      </div>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {member.witnessName ? (
                <div>
                  <dt className="text-[var(--muted)]">Witness</dt>
                  <dd className="mt-0.5">{member.witnessName}</dd>
                </div>
              ) : null}
              <div className="border-t border-[var(--border)] pt-4">
                <dt className="text-[var(--muted)]">Record ID</dt>
                <dd className="mt-0.5 font-mono text-xs break-all text-[var(--muted)]">
                  {member.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <MemberServiceRequestsSection
          requests={serviceRequests}
          variant="admin"
        />
      </main>
    </div>
  );
}
