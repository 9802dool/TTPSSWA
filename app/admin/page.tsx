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

type Props = {
  searchParams: Promise<{ q?: string }> | { q?: string };
};

export default async function AdminPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const nameQuery = (sp.q ?? "").trim();

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect("/admin/login?next=/admin");
  }

  let stats: Awaited<ReturnType<typeof getAdminStats>>;
  let pendingSignups: Awaited<ReturnType<typeof getPendingMemberSignups>>;
  try {
    stats = await getAdminStats();
  } catch (e) {
    console.error("AdminPage getAdminStats error:", e);
    stats = {
      storageConfigured: false,
      totalVisits: null,
      visitsByPath: null,
      serviceRequests: [],
    };
  }
  try {
    pendingSignups = await getPendingMemberSignups();
  } catch (e) {
    console.error("AdminPage getPendingMemberSignups error:", e);
    pendingSignups = [];
  }
  const pathEntries = stats.visitsByPath
    ? Object.entries(stats.visitsByPath).sort((a, b) => b[1] - a[1])
    : [];

  const qLower = nameQuery.toLowerCase();
  const filteredSignups =
    nameQuery.length > 0
      ? pendingSignups.filter((m) => {
          const name = m.fullName.toLowerCase();
          const reg = m.regimentalNumber.toLowerCase();
          const user = (m.username ?? "").toLowerCase();
          return (
            name.includes(qLower) ||
            reg.includes(qLower) ||
            user.includes(qLower)
          );
        })
      : pendingSignups;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Site administration
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Traffic, service requests, and pending member signups
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/new-membership"
              className="text-sm font-medium text-[var(--brand)] hover:underline"
            >
              New membership database
            </Link>
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
            <Link
              href="/"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {!stats.storageConfigured ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            <p className="font-medium">Analytics storage is not configured</p>
            <p className="mt-1 text-sm opacity-90">
              Create a free Redis database at{" "}
              <a
                href="https://console.upstash.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
              >
                Upstash Console
              </a>
              , then add{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_TOKEN
              </code>{" "}
              from the database’s <strong>REST API</strong> tab to{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                .env.local
              </code>{" "}
              (or Vercel env vars). Restart{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                npm run dev
              </code>{" "}
              or redeploy.
            </p>
          </div>
        ) : null}

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Applications pending review</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                New submissions from{" "}
                <Link href="/login" className="text-[var(--brand)] hover:underline">
                  Become a Member Apply Here
                </Link>{" "}
                appear in the{" "}
                <Link
                  href="/admin/new-membership"
                  className="font-medium text-[var(--brand)] hover:underline"
                >
                  New membership database
                </Link>
                . Accept an applicant to allow members login. Pending applicants cannot
                sign in.
              </p>
            </div>
            <Link
              href="/admin/new-membership"
              className="shrink-0 text-sm font-medium text-[var(--brand)] hover:underline"
            >
              Open full database →
            </Link>
          </div>
          {pendingSignups.length > 0 ? (
            <form
              method="get"
              action="/admin"
              className="mt-4 flex flex-wrap items-end gap-2"
              role="search"
            >
              <div className="min-w-[min(100%,16rem)] flex-1">
                <label
                  htmlFor="member-name-search"
                  className="block text-xs font-medium text-[var(--muted)]"
                >
                  Search members
                </label>
                <input
                  id="member-name-search"
                  name="q"
                  type="search"
                  defaultValue={nameQuery}
                  placeholder="Name, username, or regimental number"
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none ring-[var(--brand)] placeholder:text-[var(--muted)] focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--fg)] shadow-sm transition hover:bg-[var(--bg)]"
              >
                Search
              </button>
              {nameQuery ? (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm text-[var(--brand)] hover:underline"
                >
                  Clear
                </Link>
              ) : null}
            </form>
          ) : null}
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {pendingSignups.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted)]">
                {stats.storageConfigured
                  ? "No pending signups yet."
                  : "Redis not configured — signups cannot be queued until environment variables are set."}
              </p>
            ) : filteredSignups.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted)]">
                No members match{" "}
                <span className="font-medium text-[var(--fg)]">
                  &quot;{nameQuery}&quot;
                </span>
                .{" "}
                <Link href="/admin" className="text-[var(--brand)] hover:underline">
                  Clear search
                </Link>
              </p>
            ) : (
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Accept</th>
                    <th className="px-4 py-3 font-medium">Profile</th>
                    <th className="px-4 py-3 font-medium">Submitted (UTC)</th>
                    <th className="px-4 py-3 font-medium">Photo</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Password</th>
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
                          View profile
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
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                        {row.passwordHash ? "Hashed" : "—"}
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
        </section>

        <section>
          <h2 className="text-base font-semibold">Visits</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Page views recorded from the public site (admin routes excluded).
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <dt className="text-sm text-[var(--muted)]">Total page views</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {stats.totalVisits ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:col-span-1">
              <dt className="text-sm text-[var(--muted)]">Paths tracked</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {stats.visitsByPath ? pathEntries.length : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold">Views by path</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {pathEntries.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted)]">
                No path data yet. Browse the public site to record visits.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Path</th>
                    <th className="px-4 py-3 font-medium tabular-nums">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {pathEntries.map(([path, count]) => (
                    <tr
                      key={path}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="max-w-[min(100vw,28rem)] truncate px-4 py-3 font-mono text-xs">
                        {path}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Service requests</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Successful submissions (hotel bookings and future services).
              </p>
            </div>
            <Link
              href="/admin/hotel-reservations"
              className="shrink-0 text-sm font-medium text-[var(--brand)] hover:underline"
            >
              Hotel reservation database →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {stats.serviceRequests.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted)]">
                No service requests logged yet.
              </p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">When (UTC)</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceRequests.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--border)] align-top last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.createdAt}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {row.serviceType.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-[var(--fg)]">
                          {JSON.stringify(row.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
