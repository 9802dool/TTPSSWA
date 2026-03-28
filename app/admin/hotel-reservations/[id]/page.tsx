import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { getHotelReservationById } from "@/lib/analytics-storage";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";

type Props = { params: Promise<{ id: string }> | { id: string } };

function str(p: Record<string, unknown>, key: string): string {
  const v = p[key];
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function roomMixOrRooms(p: Record<string, unknown>): string {
  const pres = Number(p.presidentialSuite ?? 0);
  const fb = Number(p.fullBedRoom ?? 0);
  const db = Number(p.doubleBedRoom ?? 0);
  const hasMix = [pres, fb, db].some((n) => Number.isFinite(n) && n > 0);
  if (hasMix) {
    const parts: string[] = [];
    if (pres > 0) parts.push(`presidential ${pres}`);
    if (fb > 0) parts.push(`full bed ${fb}`);
    if (db > 0) parts.push(`double ${db}`);
    return `${parts.join(", ")} (${str(p, "rooms") || "?"} total)`;
  }
  return str(p, "rooms") || "—";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const decoded = decodeURIComponent(id);
  const { record } = await getHotelReservationById(decoded);
  if (!record) {
    return { title: "Reservation | Admin | TTPSSWA" };
  }
  const name = str(record.payload, "fullName") || "Hotel reservation";
  return {
    title: `${name} | Hotel reservation | Admin`,
    description: `Submitted ${record.createdAt}`,
  };
}

export default async function AdminHotelReservationDetailPage({ params }: Props) {
  const { id } = await Promise.resolve(params);
  const decodedId = decodeURIComponent(id);

  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/admin/hotel-reservations/${encodeURIComponent(decodedId)}`)}`,
    );
  }

  const { storageConfigured, record } = await getHotelReservationById(decodedId);
  if (!storageConfigured) {
    redirect("/admin/hotel-reservations");
  }
  if (!record) {
    notFound();
  }

  const p = record.payload;
  const emailVal = str(p, "email");
  const phoneVal = str(p, "phone");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[4.25rem]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link
                href="/admin/hotel-reservations"
                className="text-[var(--brand)] hover:underline"
              >
                ← Hotel reservation database
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Hotel reservation
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {str(p, "fullName") || "—"} · {record.createdAt.replace("T", " ").replace(/\.\d{3}Z$/, "")}{" "}
              UTC
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin" className="text-sm text-[var(--brand)] hover:underline">
              Site administration
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Details
            </p>
          </div>
          <dl className="space-y-4 p-6 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Record ID</dt>
              <dd className="mt-0.5 font-mono text-xs break-all">{record.id}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Submitted (UTC)</dt>
              <dd className="mt-0.5 font-mono text-xs">
                {record.createdAt.replace("T", " ").replace(/\.\d{3}Z$/, "")}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Full name</dt>
              <dd className="mt-0.5 font-medium">{str(p, "fullName") || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Email</dt>
              <dd className="mt-0.5">
                {emailVal ? (
                  <a
                    href={`mailto:${encodeURIComponent(emailVal)}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {emailVal}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Phone</dt>
              <dd className="mt-0.5">
                {phoneVal ? (
                  <a
                    href={`tel:${phoneVal.replace(/\s/g, "")}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {phoneVal}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Check-in</dt>
              <dd className="mt-0.5">
                {str(p, "checkInDate") || "—"}
                {str(p, "checkInTime") ? ` · ${str(p, "checkInTime")}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Check-out</dt>
              <dd className="mt-0.5">
                {str(p, "checkOutDate") || "—"}
                {str(p, "checkOutTime") ? ` · ${str(p, "checkOutTime")}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Room mix</dt>
              <dd className="mt-0.5 leading-relaxed">{roomMixOrRooms(p)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Guests</dt>
              <dd className="mt-0.5 tabular-nums">{str(p, "guests") || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Notes</dt>
              <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed">
                {str(p, "notes") || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
