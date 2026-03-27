import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-session";
import { getAllMemberApplications } from "@/lib/member-signup-storage";

type Props = {
  searchParams: Promise<{ q?: string; status?: string }> | { q?: string; status?: string };
};

export default async function AdminMembersDatabasePage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const nameQuery = (sp.q ?? "").trim();
  const statusFilter = (sp.status ?? "all").trim().toLowerCase();

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect("/admin/login?next=/admin/members");
  }

  let allMembers: Awaited<ReturnType<typeof getAllMemberApplications>>;
  try {
    allMembers = await getAllMemberApplications();
  } catch (e) {
    console.error("AdminMembersDatabasePage getAllMemberApplications error:", e);
    allMembers = [];
  }

  const statusOk =
    statusFilter === "pending" ||
    statusFilter === "accepted" ||
    statusFilter === "rejected"
      ? statusFilter
      : "all";

  let rows = allMembers;
  if (statusOk !== "all") {
    rows = rows.filter((m) => m.applicationStatus === statusOk);
  }

  const qLower = nameQuery.toLowerCase();
  const filtered =
    nameQuery.length > 0
      ? rows.filter((m) => {
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
      : rows;

  const statusBadge = (s: string) => {
    if (s === "accepted")
      return "text-green-700 dark:text-green-400";
    if (s === "rejected")
      return "text-red-700 dark:text-red-400";
    return "text-amber-700 dark:text-amber-400";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[4.25rem]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/admin" className="text-[var(--brand)] hover:underline">
                ← Site administration
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Members profile database
            </h1>
            <p className="text-sm text-[var(--muted)]">
              All member applications in Redis ({allMembers.length} record
              {allMembers.length === 1 ? "" : "s"})
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">Status:</span>
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["accepted", "Accepted"],
              ["rejected", "Rejected"],
            ] as const
          ).map(([val, label]) => {
            const active = statusOk === val;
            const href =
              val === "all"
                ? `/admin/members${nameQuery ? `?q=${encodeURIComponent(nameQuery)}` : ""}`
                : `/admin/members?status=${val}${nameQuery ? `&q=${encodeURIComponent(nameQuery)}` : ""}`;
            return (
              <Link
                key={val}
                href={href}
                className={
                  active
                    ? "rounded-full bg-[var(--brand)] px-3 py-1 font-medium text-white"
                    : "rounded-full border border-[var(--border)] px-3 py-1 text-[var(--muted)] hover:bg-[var(--bg)]"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>

        <form
          method="get"
          action="/admin/members"
          className="flex flex-wrap items-end gap-2"
          role="search"
        >
          {statusOk !== "all" ? (
            <input type="hidden" name="status" value={statusOk} />
          ) : null}
          <div className="min-w-[min(100%,16rem)] flex-1">
            <label
              htmlFor="member-db-search"
              className="block text-xs font-medium text-[var(--muted)]"
            >
              Search
            </label>
            <input
              id="member-db-search"
              name="q"
              type="search"
              defaultValue={nameQuery}
              placeholder="Name, username, email, or regimental number"
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
              href={
                statusOk === "all"
                  ? "/admin/members"
                  : `/admin/members?status=${statusOk}`
              }
              className="rounded-lg px-3 py-2 text-sm text-[var(--brand)] hover:underline"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              {allMembers.length === 0
                ? "No member applications in storage yet."
                : "No records match your filters."}
            </p>
          ) : (
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted (UTC)</th>
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Reg #</th>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/members/${encodeURIComponent(row.id)}`}
                        className="font-medium text-[var(--brand)] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                    <td className={`px-4 py-3 capitalize ${statusBadge(row.applicationStatus)}`}>
                      {row.applicationStatus}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {row.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${row.photoMimeType};base64,${row.photoBase64}`}
                        alt=""
                        className="h-12 w-12 rounded-md border border-[var(--border)] object-cover"
                      />
                    </td>
                    <td className="max-w-[10rem] px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="max-w-[8rem] px-4 py-3 font-mono text-xs">
                      {row.username ?? "—"}
                    </td>
                    <td className="max-w-[8rem] px-4 py-3 font-mono text-xs">
                      {row.regimentalNumber}
                    </td>
                    <td className="px-4 py-3">{row.rank}</td>
                    <td className="max-w-[12rem] break-all px-4 py-3 text-xs">
                      {row.email}
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
