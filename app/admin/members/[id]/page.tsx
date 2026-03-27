import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
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
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect("/admin/login");
  }

  const { id } = await Promise.resolve(params);
  const member = await getPendingMemberSignupById(decodeURIComponent(id));
  if (!member) {
    notFound();
  }

  const photoSrc = `data:${member.photoMimeType};base64,${member.photoBase64}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[4.25rem]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link
                href="/admin"
                className="text-[var(--brand)] hover:underline"
              >
                ← Site administration
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Member profile
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Pending signup · Submitted {member.createdAt} (UTC)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Status
            </p>
            <p className="mt-1 font-medium capitalize text-amber-700 dark:text-amber-400">
              {member.status}
            </p>
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
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {member.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Financial member</dt>
                <dd className="mt-0.5 capitalize">{member.financialMember}</dd>
              </div>
              <div className="border-t border-[var(--border)] pt-4">
                <dt className="text-[var(--muted)]">Record ID</dt>
                <dd className="mt-0.5 font-mono text-xs break-all text-[var(--muted)]">
                  {member.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
