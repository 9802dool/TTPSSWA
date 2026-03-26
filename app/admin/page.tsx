import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { getAdminStats } from "@/lib/analytics-storage";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect("/admin/login");
  }

  const stats = await getAdminStats();
  const pathEntries = stats.visitsByPath
    ? Object.entries(stats.visitsByPath).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[4.25rem]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Site administration
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Traffic and service request records
            </p>
          </div>
          <div className="flex items-center gap-3">
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
          <h2 className="text-base font-semibold">Service requests</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Successful submissions (hotel bookings and future services).
          </p>
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
