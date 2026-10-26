import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import {
  getHotelReservationRecords,
  type ServiceRequestRecord,
} from "@/lib/analytics-storage";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getApplications } from "@/lib/supabase/applications";
import type { Application } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Hotel reservations | Admin | TTPSSWA",
  description:
    "Searchable log of hotel reservation requests stored with site analytics.",
};

type Props = {
  searchParams: Promise<{ q?: string }> | { q?: string };
};

function str(p: Record<string, unknown>, key: string): string {
  const v = p[key];
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function rowSearchBlob(row: ServiceRequestRecord): string {
  const p = row.payload;
  return [
    str(p, "fullName"),
    str(p, "email"),
    str(p, "phone"),
    str(p, "checkInDate"),
    str(p, "checkOutDate"),
    str(p, "checkInTime"),
    str(p, "checkOutTime"),
    str(p, "rooms"),
    str(p, "guests"),
    str(p, "children"),
    str(p, "notes"),
    row.id,
    row.createdAt,
  ]
    .join(" ")
    .toLowerCase();
}

export default async function AdminHotelReservationsPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const nameQuery = (sp.q ?? "").trim();

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    redirect("/admin/login?next=/admin/hotel-reservations");
  }

  // Fetch from both Redis (legacy) and Supabase (new)
  let redisRecords: ServiceRequestRecord[] = [];
  let supabaseApplications: Application[] = [];

  try {
    const db = await getHotelReservationRecords();
    redisRecords = db.records;
  } catch (e) {
    console.error("Error fetching Redis hotel reservations:", e);
  }

  if (isSupabaseConfigured()) {
    try {
      supabaseApplications = await getApplications({
        type: 'hotel_booking',
        limit: 1000,
      });
    } catch (e) {
      console.error("Error fetching Supabase hotel bookings:", e);
    }
  }

  // Convert Supabase applications to display format
  const supabaseRecords: ServiceRequestRecord[] = supabaseApplications.map(app => ({
    id: app.id,
    serviceType: 'hotel_booking',
    createdAt: new Date(app.submitted_at).toISOString(),
    payload: {
      ...(app.application_data as Record<string, unknown>),
      source: 'supabase',
    },
  }));

  // Combine both sources
  const allRecords = [...supabaseRecords, ...redisRecords];

  const qLower = nameQuery.toLowerCase();
  const filtered =
    nameQuery.length > 0
      ? allRecords.filter((row) => rowSearchBlob(row).includes(qLower))
      : allRecords;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="site-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/admin" className="text-[var(--brand)] hover:underline">
                ← Site administration
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Hotel reservation database
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Hotel bookings from Supabase ({supabaseApplications.length}) and legacy Redis ({redisRecords.length})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/new-membership"
              className="text-sm font-medium text-[var(--brand)] hover:underline"
            >
              New Membership Applications
            </Link>
            <Link
              href="/admin/members"
              className="text-sm text-[var(--brand)] hover:underline"
            >
              Members database
            </Link>
            <Link href="/" className="text-sm text-[var(--brand)] hover:underline">
              Home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="site-container space-y-6 py-10">
        {supabaseApplications.length > 0 && (
          <p className="text-sm text-[var(--muted)]">
            Showing {supabaseApplications.length} from Supabase
            {redisRecords.length > 0 && ` + ${redisRecords.length} from Redis`}
          </p>
        )}

        {allRecords.length === 0 && !isSupabaseConfigured() ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            <p className="font-medium">Storage is not configured</p>
            <p className="mt-1 text-sm opacity-90">
              Hotel reservations are stored in Supabase or Redis (legacy). Add{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                UPSTASH_REDIS_REST_TOKEN
              </code>{" "}
              to your environment to enable this log.
            </p>
          </div>
        ) : null}

        <form
          method="get"
          action="/admin/hotel-reservations"
          className="flex flex-wrap items-end gap-2"
          role="search"
        >
          <div className="min-w-[min(100%,16rem)] flex-1">
            <label
              htmlFor="hotel-db-search"
              className="block text-xs font-medium text-[var(--muted)]"
            >
              Search
            </label>
            <input
              id="hotel-db-search"
              name="q"
              type="search"
              defaultValue={nameQuery}
              placeholder="Name, email, phone, dates, notes, or record id"
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
              href="/admin/hotel-reservations"
              className="rounded-lg px-3 py-2 text-sm text-[var(--brand)] hover:underline"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              {allRecords.length === 0
                ? "No hotel reservations yet."
                : "No records match your search."}
            </p>
          ) : (
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">Submitted (UTC)</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Check-out</th>
                  <th className="px-4 py-3 font-medium tabular-nums">Rooms</th>
                  <th className="px-4 py-3 font-medium tabular-nums">Adults</th>
                  <th className="px-4 py-3 font-medium tabular-nums">Children</th>
                  <th className="min-w-[12rem] px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const p = row.payload;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--border)] align-top last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/admin/hotel-reservations/${encodeURIComponent(row.id)}`}
                          className="font-medium text-[var(--brand)] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.createdAt.replace("T", " ").replace(/\.\d{3}Z$/, "")}
                      </td>
                      <td className="max-w-[10rem] px-4 py-3 font-medium">
                        {str(p, "fullName") || "—"}
                      </td>
                      <td className="max-w-[12rem] break-all px-4 py-3 text-xs">
                        {str(p, "email") ? (
                          <a
                            href={`mailto:${encodeURIComponent(str(p, "email"))}`}
                            className="text-[var(--brand)] hover:underline"
                          >
                            {str(p, "email")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {str(p, "phone") ? (
                          <a
                            href={`tel:${str(p, "phone").replace(/\s/g, "")}`}
                            className="text-[var(--brand)] hover:underline"
                          >
                            {str(p, "phone")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        {str(p, "checkInDate")}
                        {str(p, "checkInTime") ? ` · ${str(p, "checkInTime")}` : ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        {str(p, "checkOutDate")}
                        {str(p, "checkOutTime") ? ` · ${str(p, "checkOutTime")}` : ""}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{str(p, "rooms") || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{str(p, "guests") || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{str(p, "children") && str(p, "children") !== "0" ? str(p, "children") : "—"}</td>
                      <td className="max-w-[18rem] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
                        {str(p, "notes") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-[var(--muted)]">
          Record IDs are stored internally for deduplication; search includes id and
          timestamp. Data is retained in order of submission (newest first, capped at
          500 entries).
        </p>
      </main>
    </div>
  );
}
