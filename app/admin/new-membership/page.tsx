import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminQuickAcceptButton } from "@/components/AdminQuickAcceptButton";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { formatMemberPhoneDisplay } from "@/lib/member-phone";
import { getAdminStats } from "@/lib/analytics-storage";
import { getPendingMemberSignups } from "@/lib/member-signup-storage";

export const metadata: Metadata = {
  title: "New Membership Applications | Admin | TTPSSWA",
  description:
    "Pending online membership applications submitted from the public site.",
};

type Props = {
  searchParams: Promise<{ q?: string }> | { q?: string };
};

export default async function AdminNewMembershipDatabasePage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const nameQuery = (sp.q ?? "").trim();

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect("/admin/login?next=/admin/new-membership");
  }

  let stats: Awaited<ReturnType<typeof getAdminStats>>;
  let pendingSignups: Awaited<ReturnType<typeof getPendingMemberSignups>>;
  try {
    stats = await getAdminStats();
  } catch (e) {
    console.error("AdminNewMembershipDatabasePage getAdminStats error:", e);
    stats = { storageConfigured: false, totalVisits: null, visitsByPath: null, serviceRequests: [] };
  }
  try {
    pendingSignups = await getPendingMemberSignups();
  } catch (e) {
    console.error("AdminNewMembershipDatabasePage getPendingMemberSignups error:", e);
    pendingSignups = [];
  }

  const qLower = nameQuery.toLowerCase();
  const filteredSignups =
    nameQuery.length > 0
      ? pendingSignups.filter((m) => {
          const name = m.fullName.toLowerCase();
          const reg = m.regimentalNumber.toLowerCase();
          const user = (m.username ?? "").toLowerCase();
          const mail = m.email.toLowerCase();
          return (
            name.includes(qLower) ||
            reg.includes(qLower) ||
            user.includes(qLower) ||
            mail.includes(qLower)
          );
        })
      : pendingSignups;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/admin" className="text-[var(--brand)] hover:underline">
                ← Site administration
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              New Membership Applications
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Pending applications from{" "}
              <Link href="/login" className="text-[var(--brand)] hover:underline">
                Become a Member Apply Here
              </Link>{" "}
              ({pendingSignups.length} awaiting review)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/members"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Members database
            </Link>
            <Link
              href="/admin/hotel-reservations"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Hotel reservations
            </Link>
            <Link href="/" className="text-sm text-[var(--brand)] hover:underline">
              Home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        {!stats.storageConfigured ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            <p className="font-medium">Redis is not configured</p>
            <p className="mt-1 text-sm opacity-90">
              New applications cannot be stored until{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_TOKEN
              </code>{" "}
              are set. Accepted or rejected applications leave this list and remain in
              the full{" "}
              <Link href="/admin/members" className="font-medium underline">
                Members database
              </Link>
              .
            </p>
          </div>
        ) : null}

        <p className="text-sm text-[var(--muted)]">
          Each submission appears here as <strong className="text-[var(--fg)]">pending</strong>{" "}
          until you accept or reject it. Open a row for the full application (including
          beneficiary and declaration). Accepting enables{" "}
          <Link href="/members/login" className="text-[var(--brand)] hover:underline">
            Members login
          </Link>
          .
        </p>

        {pendingSignups.length > 0 ? (
          <form
            method="get"
            action="/admin/new-membership"
            className="flex flex-wrap items-end gap-2"
            role="search"
          >
            <div className="min-w-[min(100%,16rem)] flex-1">
              <label
                htmlFor="new-member-search"
                className="block text-xs font-medium text-[var(--muted)]"
              >
                Search applications
              </label>
              <input
                id="new-member-search"
                name="q"
                type="search"
                defaultValue={nameQuery}
                placeholder="Name, email, username, or regimental number"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none ring-[var(--brand)] placeholder:text-[var(--muted)] focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="site-btn-admin-muted"
            >
              Search
            </button>
            {nameQuery ? (
              <Link
                href="/admin/new-membership"
                className="rounded-lg px-3 py-2 text-sm text-[var(--brand)] hover:underline"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {pendingSignups.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              {stats.storageConfigured
                ? "No pending membership applications. New submissions from Become a Member Apply Here will appear here."
                : "Redis not configured — applications cannot be queued."}
            </p>
          ) : filteredSignups.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              No applications match{" "}
              <span className="font-medium text-[var(--fg)]">&quot;{nameQuery}&quot;</span>
              .{" "}
              <Link href="/admin/new-membership" className="text-[var(--brand)] hover:underline">
                Clear search
              </Link>
            </p>
          ) : (
            <table className="w-full min-w-[1280px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Accept</th>
                  <th className="px-4 py-3 font-medium">Application</th>
                  <th className="px-4 py-3 font-medium">Submitted (UTC)</th>
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Reg #</th>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Financial</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignups.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      <AdminQuickAcceptButton memberId={row.id} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/members/${encodeURIComponent(row.id)}`}
                        className="font-medium text-[var(--brand)] hover:underline"
                      >
                        View application
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {row.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${row.photoMimeType};base64,${row.photoBase64}`}
                        alt=""
                        className="h-14 w-14 rounded-md border border-[var(--border)] object-cover"
                      />
                    </td>
                    <td className="max-w-[8rem] px-4 py-3 font-mono text-xs">
                      {row.username ?? "—"}
                    </td>
                    <td className="max-w-[8rem] px-4 py-3 font-mono text-xs">
                      {row.regimentalNumber}
                    </td>
                    <td className="px-4 py-3">{row.rank}</td>
                    <td className="px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="px-4 py-3 capitalize">{row.financialMember}</td>
                    <td className="max-w-[12rem] break-all px-4 py-3 text-xs">
                      {row.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatMemberPhoneDisplay(row)}
                    </td>
                    <td className="max-w-[14rem] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
                      {row.address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
